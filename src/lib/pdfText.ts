import { textFromPdfItems } from '../domain/pdfStatement';

type TextItem = { str: string; transform: number[]; width: number };
type PdfJs = {
  getDocument: (options: { data: Uint8Array; isEvalSupported: boolean; useSystemFonts: boolean }) => {
    promise: Promise<{ numPages: number; getPage: (number: number) => Promise<{ getTextContent: () => Promise<{ items: Record<string, unknown>[] }> }>; destroy: () => Promise<void> }>;
    destroy: () => Promise<void>;
  };
};
type BrowserPdfGlobal = typeof globalThis & { __cifrioPdfJs?: PdfJs };
let browserPdf: Promise<PdfJs> | undefined;

async function loadPdfJs(): Promise<PdfJs> {
  if (typeof document === 'undefined') {
    // The real Node PDF.js adapter is installed only by Vitest, never imported by app code.
    const adapter = (globalThis as BrowserPdfGlobal).__cifrioPdfJs;
    if (typeof process !== 'undefined' && process.versions?.node && adapter) return adapter;
    throw new Error('A leitura de PDF está disponível na versão web. Abra o Cifrio no navegador; no app nativo, use CSV ou OFX.');
  }
  if (browserPdf) return browserPdf;
  browserPdf = new Promise<PdfJs>((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module'; script.src = '/pdfjs/5.4.296/loader.mjs';
    const fail = () => { clearTimeout(timer); script.remove(); reject(new Error('Não foi possível carregar o leitor PDF. Confira a conexão e tente novamente.')); };
    const timer = setTimeout(fail, 15000);
    script.onerror = fail;
    script.onload = () => {
      clearTimeout(timer); script.remove();
      const pdfjs = (globalThis as BrowserPdfGlobal).__cifrioPdfJs;
      if (pdfjs) resolve(pdfjs); else fail();
    };
    document.head.appendChild(script);
  }).catch(error => { browserPdf = undefined; throw error; });
  return browserPdf;
}

export async function readPdfText(data: Uint8Array) {
  if (data.byteLength > 8_000_000) throw new Error('Use um PDF de até 8 MB.');
  if (data.length < 5 || data[0] !== 0x25 || data[1] !== 0x50 || data[2] !== 0x44 || data[3] !== 0x46) throw new Error('Arquivo PDF não reconhecido.');
  const pdfjs = await loadPdfJs();
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
  } finally { await task.destroy(); }
}
