import { NextRequest } from 'next/server';
import { getClient, MODEL, MAX_TOKENS } from '@/lib/claude';
import { extractPdfText } from '@/lib/pdf';
import { buildProposalPrompt } from '@/lib/prompts';
import type { AdvancedOptions, PricingModel, Currency, Region, ProviderCategory } from '@/types';

const VALID_PRICING_MODELS:    PricingModel[]     = ['auto', 'fixed', 'hourly', 'retainer', 'milestone', 'package'];
const VALID_CURRENCIES:        Currency[]         = ['auto', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'];
const VALID_REGIONS:           Region[]           = ['auto', 'us', 'uk', 'eu', 'ca', 'au'];
const VALID_PROVIDER_CATEGORIES: ProviderCategory[] = ['freelancer', 'small-business', 'agency'];

function parseEnum<T extends string>(
  raw: FormDataEntryValue | null,
  valid: T[],
  fallback: T,
): T {
  return valid.includes(raw as T) ? (raw as T) : fallback;
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const file = formData.get('pdf') as File | null;

  if (!file) {
    return Response.json({ error: 'No PDF file provided.' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 });
  }
  if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
    return Response.json({ error: 'Only PDF files are accepted.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let pdfText: string;
  try {
    pdfText = await extractPdfText(buffer);
  } catch {
    return Response.json({
      error: 'Could not read the PDF. Ensure it contains selectable text, not a scanned image.',
    }, { status: 422 });
  }

  if (!pdfText || pdfText.trim().length < 100) {
    return Response.json({
      error: 'The PDF appears empty or image-only. Please upload a PDF with readable text.',
    }, { status: 422 });
  }

  const advancedOptions: AdvancedOptions = {
    industryOverride:     ((formData.get('industryOverride') as string) ?? '').trim(),
    pricingModelOverride: parseEnum(formData.get('pricingModelOverride'), VALID_PRICING_MODELS, 'auto'),
    currency:             parseEnum(formData.get('currency'), VALID_CURRENCIES, 'auto'),
    region:               parseEnum(formData.get('region'), VALID_REGIONS, 'auto'),
  };

  const providerCategory: ProviderCategory = parseEnum(
    formData.get('providerCategory'),
    VALID_PROVIDER_CATEGORIES,
    'freelancer',
  );

  const prompt = buildProposalPrompt(pdfText.trim(), providerCategory, advancedOptions);

  const anthropicStream = getClient().messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(enc.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
