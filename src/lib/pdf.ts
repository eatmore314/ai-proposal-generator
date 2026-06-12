export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Dynamic import avoids Next.js bundling pdf-parse for the browser
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text ?? '';
}
