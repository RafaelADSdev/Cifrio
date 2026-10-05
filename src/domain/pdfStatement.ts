import { ImportRow, importDate } from './imports';
import { parseMoney } from './money';

export type PdfTextItem = { str: string; x: number; y: number; width: number };
const SUMMARY = /(\bsaldo(\s+(anterior|do dia|dispon[ií]vel|final|atual|em conta))?\b|\btotal(\s+(geral|de cr[eé]ditos|de d[eé]bitos))?\b|\bsubtotal\b)/i;
const HOLDER = /^(\d{2})-\s+(.+?)\s+Cart[aã]o\s+N\./i;
const CARD_INVOICE = /Cart[aã]o\s+N\.|OUROCARD/i;
const PARTICLES = new Set(['DE', 'DA', 'DO', 'DOS', 'DAS', 'E']);

export function textFromPdfItems(pages: PdfTextItem[][]) {
  return pages.map(items => {
    const rows: { y: number; parts: PdfTextItem[] }[] = [];
    for (const item of items) {
      if (!item.str.trim()) continue;
      const row = rows.find(candidate => Math.abs(candidate.y - item.y) <= 3);
      if (row) row.parts.push(item);
      else rows.push({ y: item.y, parts: [item] });
    }
    return rows.sort((a, b) => b.y - a.y).map(row => {
      const parts = row.parts.sort((a, b) => a.x - b.x);
      let line = '', cursor = 0;
      for (const part of parts) {
        if (line && part.x > cursor + 1) line += ' ';
        line += part.str;
        cursor = part.x + part.width;
      }
      return line.replace(/\s+/g, ' ').trim();
    }).filter(Boolean).join('\n');
  }).filter(Boolean).join('\n');
}

function statementYear(text: string) {
  return text.match(/\b\d{2}\/\d{2}\/(20\d{2})\b/)?.[1] ?? text.match(/\b(20\d{2})\b/)?.[1];
}
function completeDate(raw: string, year?: string) {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return importDate(raw);
  if (/^\d{2}\/\d{2}\/\d{2}$/.test(raw)) {
    const [day, month, short] = raw.split('/');
    return importDate(`${day}/${month}/${Number(short) >= 70 ? '19' : '20'}${short}`);
  }
  if (!year) throw new Error('O PDF não informa o ano. Use um extrato com data completa.');
  return importDate(`${raw}/${year}`);
}
export function foldName(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().replace(/[^A-Z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function nameTokens(value: string) {
  return foldName(value).split(' ').filter(token => token.length >= 2 && !PARTICLES.has(token));
}
export function sameCardholder(profile: string, holder: string) {
  const wanted = nameTokens(profile), found = nameTokens(holder);
  return wanted.length > 0 && found.length > 0 && wanted[0] === found[0] && wanted.every(token => found.includes(token));
}
function cardSections(text: string) {
  const sections: { name: string; lines: { line: number; text: string }[] }[] = [];
  let current: (typeof sections)[number] | undefined;
  text.split(/\n/).forEach((raw, index) => {
    const textLine = raw.replace(/\s+/g, ' ').trim();
    if (!textLine) return;
    const header = textLine.match(HOLDER);
    if (header) { current = { name: header[2].trim(), lines: [] }; sections.push(current); return; }
    if (current) current.lines.push({ line: index + 1, text: textLine });
  });
  return sections;
}
export function invoiceCardholders(text: string) {
  return cardSections(text).map(section => section.name);
}
function movement(line: string, year: string | undefined, cardInvoice: boolean) {
  if (SUMMARY.test(line)) return null;
  const dateMatch = line.match(/^(\d{2}\/\d{2}(?:\/\d{2,4})?)\b/);
  const moneyMatch = line.match(/(?:R\$\s*)?(-?\d{1,3}(?:\.\d{3})*,\d{2})(\s*[DC]|-)?\s*$/i);
  if (!dateMatch || !moneyMatch || moneyMatch.index === undefined) return null;
  const description = line.slice(dateMatch[0].length, moneyMatch.index).replace(/\s+/g, ' ').trim();
  if (description.length < 2) return null;
  try {
    const date = completeDate(dateMatch[1], year);
    let amount = parseMoney(moneyMatch[1]);
    const mark = (moneyMatch[2] ?? '').replace(/\s/g, '').toUpperCase();
    if (mark === 'D' || mark === '-') amount = -Math.abs(amount);
    if (mark === 'C') amount = Math.abs(amount);
    if (cardInvoice) amount = -amount;
    if (!amount) return null;
    return { date, description, amount };
  } catch (error) { return { date: '', description, amount: 0, error: (error as Error).message }; }
}
export function parseStatementText(text: string, holderName = ''): ImportRow[] {
  if (text.length > 2_000_000) throw new Error('Arquivo muito grande. Use até 2 MB de texto.');
  const year = statementYear(text);
  const cardInvoice = CARD_INVOICE.test(text);
  const sections = cardSections(text);
  let source = text.split(/\n/).map((line, index) => ({ line: index + 1, text: line.replace(/\s+/g, ' ').trim() })).filter(item => item.text);
  if (sections.length > 1) {
    const name = holderName.trim();
    if (!name) throw new Error('Esta fatura tem mais de um cartão. Salve seu nome no perfil para importar só a sua parte.');
    const matched = sections.filter(section => sameCardholder(name, section.name));
    if (!matched.length) throw new Error(`Não encontrei uma parte da fatura para ${name}. Confira o nome salvo no perfil.`);
    source = matched.flatMap(section => section.lines);
  }
  const rows = source.flatMap(item => {
    const parsed = movement(item.text, year, cardInvoice && sections.length > 0);
    return parsed ? [{ line: item.line, ...parsed }] : [];
  });
  if (!rows.length) throw new Error(sections.length > 1 ? 'Não encontrei lançamentos na sua parte da fatura.' : 'Não encontrei movimentações com data e valor. PDF de foto, com senha ou de layout desconhecido não é importado.');
  if (rows.length > 500) throw new Error('Use um PDF com até 500 movimentações.');
  return rows;
}
