import { textFromPdfItems } from '../domain/pdfStatement';

type PdfGlobal = typeof globalThis & { pdfjsWorker?: { WorkerMessageHandler: unknown } };
type TextItem = { str: string; transform: number[]; width: number };

export async function readPdfText(data: Uint8Array) {
  if (data.byteLength > 8_000_000) throw new Error('Use um PDF de até 8 MB.');
  if (data.length < 5 || data[0] !== 0x25 || data[1] !== 0x50 || data[2] !== 0x44 || data[3] !== 0x46) throw new Error('Arquivo PDF não reconhecido.');
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const worker = await import('pdfjs-dist/legacy/build/pdf.worker.mjs') as { WorkerMessageHandler: unknown };
  (globalThis as PdfGlobal).pdfjsWorker = { WorkerMessageHandler: worker.WorkerMessageHandler };
  const task = pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: true });
  try {
    const doc = await task.promise;
    try {
      if (doc.numPages > 30) throw new Error('Use um PDF de até 30 páginas.');
      const pages = [];
      for (let number = 1; number <= doc.numPages; number++) {
        const content = await (await doc.getPage(number)).getTextContent();
        pages.push(content.items.flatMap(item => 'str' in item ? [{ str: (item as TextItem).str, x: (item as TextItem).transform[4], y: (item as TextItem).transform[5], width: (item as TextItem).width }] : []));
      }
      const text = textFromPdfItems(pages);
      if (!text.trim()) throw new Error('Este PDF não tem texto selecionável. Envie o extrato em CSV, OFX ou um PDF gerado pelo banco, não uma foto.');
      return text;
    } finally { await doc.destroy(); }
  } catch (error) {
    const name = (error as { name?: string }).name ?? '';
    if (name === 'PasswordException') throw new Error('Este PDF pede senha. Salve no banco uma cópia sem senha.');
    if (name === 'InvalidPDFException') throw new Error('Arquivo PDF não reconhecido.');
    throw error;
  }
}
