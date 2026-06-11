import { NextRequest } from 'next/server';
import { getClient, MODEL, MAX_TOKENS } from '@/lib/claude';
import { extractPdfText } from '@/lib/pdf';
import { buildProposalPrompt } from '@/lib/prompts';
import type { ProviderType } from '@/types';

const VALID_PROVIDER_TYPES: ProviderType[] = ['independent', 'consultant', 'agency'];

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
    return Response.json(
      { error: 'File too large. Maximum size is 10 MB.' },
      { status: 400 },
    );
  }
  if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
    return Response.json(
      { error: 'Only PDF files are accepted.' },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let pdfText: string;
  try {
    pdfText = await extractPdfText(buffer);
  } catch {
    return Response.json(
      {
        error:
          'Could not read the PDF. Ensure it contains selectable text, not a scanned image.',
      },
      { status: 422 },
    );
  }

  if (!pdfText || pdfText.trim().length < 100) {
    return Response.json(
      {
        error:
          'The PDF appears empty or image-only. Please upload a PDF with readable text.',
      },
      { status: 422 },
    );
  }

  const rawProvider = formData.get('providerType') as string | null;
  const providerType: ProviderType =
    rawProvider && VALID_PROVIDER_TYPES.includes(rawProvider as ProviderType)
      ? (rawProvider as ProviderType)
      : 'independent';

  const prompt = buildProposalPrompt(pdfText.trim(), providerType);
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
