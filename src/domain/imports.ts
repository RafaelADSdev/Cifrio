import { categories, Entry } from './model';
import { assertDate, parseMoney } from './money';
export type ImportRow = { line: number; date: string; description: string; amount: number; category?: string; externalId?: string; error?: string };
export type ImportPreview = { headers: string[]; rawRows: string[][] };
export function splitCsv(text: string): ImportPreview {
  if (text.length > 2_000_000) throw new Error('Arquivo muito grande. Use até 2 MB.');
  const first = text.replace(/^\uFEFF/, '').split(/\r?\n/)[0];
  const delimiter = first.includes(';') ? ';' : first.includes('\t') ? '\t' : ',';
  const rows: string[][] = []; let row: string[] = [], field = '', quoted = false;
  const content = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') { if (quoted && content[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (char === delimiter && !quoted) { row.push(field.trim()); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && content[i + 1] === '\n') i++;
      row.push(field.trim()); if (row.some(Boolean)) rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (quoted) throw new Error('CSV com aspas não fechadas.');
  row.push(field.trim()); if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2 || rows.length > 501) throw new Error('Use um CSV com cabeçalho e entre 1 e 500 movimentações.');
  return { headers: rows[0], rawRows: rows.slice(1) };
}
export function importDate(raw: string) {
  const date = /^\d{2}\/\d{2}\/\d{4}$/.test(raw) ? raw.split('/').reverse().join('-') : raw;
  assertDate(date); return date;
}
export function mapCsv(preview: ImportPreview, mapping: { date: number; description: number; amount: number }): ImportRow[] {
  return preview.rawRows.map((row, i) => {
    try {
      if (row.length !== preview.headers.length) throw new Error('Quantidade de colunas diferente do cabeçalho.');
      const date = importDate(row[mapping.date] ?? ''), description = row[mapping.description]?.trim(), amount = parseMoney(row[mapping.amount] ?? '');
      if (!description || !amount) throw new Error('Descrição vazia ou valor zero.');
      return { line: i + 2, date, description, amount };
    } catch (e) { return { line: i + 2, date: '', description: '', amount: 0, error: (e as Error).message }; }
  });
}
export function parseOfx(text: string): ImportRow[] {
  if (text.length > 2_000_000) throw new Error('Arquivo muito grande. Use até 2 MB.');
  if (!/<OFX>/i.test(text)) throw new Error('Arquivo OFX não reconhecido.');
  const blocks = [...text.matchAll(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi)];
  if (!blocks.length || blocks.length > 500) throw new Error('Use um OFX com entre 1 e 500 movimentações.');
  return blocks.map((match, i) => {
    const field = (tag: string) => new RegExp(`<${tag}>([^<\r\n]+)`, 'i').exec(match[1])?.[1]?.trim() ?? '';
    try {
      const raw = field('DTPOSTED').slice(0, 8), date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      assertDate(date);
      const amount = parseMoney(field('TRNAMT')), description = field('MEMO') || field('NAME');
      if (!amount || !description) throw new Error('Descrição vazia ou valor zero.');
      return { line: i + 1, date, amount, description, externalId: field('FITID') || undefined };
    } catch (e) { return { line: i + 1, date: '', amount: 0, description: '', error: (e as Error).message }; }
  });
}
export function importEntries(rows: ImportRow[], accountId: string, fileKey: string, createId: () => string, origin: 'csv' | 'pdf' = 'csv'): Entry[] {
  if (rows.some(row => row.error)) throw new Error('Corrija ou desmarque as linhas inválidas.');
  return rows.map(row => ({ id: createId(), kind: row.amount > 0 ? 'income' : 'expense', accountId, amount: Math.abs(row.amount), date: row.date, description: row.description, category: categories.find(category => category === row.category) ?? 'Outros', method: 'debit', source: 'Arquivo importado', sourceKey: row.externalId ? `ofx:${row.externalId}` : `${origin}:${fileKey}:${row.line}` }));
}
