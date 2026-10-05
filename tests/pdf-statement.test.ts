import { existsSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { importEntries } from '../src/domain/imports';
import { invoiceCardholders, parseStatementText, textFromPdfItems } from '../src/domain/pdfStatement';
import { readPdfText } from '../src/lib/pdfText';

const statement = `Período 01/10/2026 a 31/10/2026
Data Histórico Valor
01/10/2026 PIX Recebido 150,00 C
02/10 Mercado -45,90
03/10/2026 Tarifa 4,50 D
Saldo anterior 1.000,00
03/10/2026 Saldo do dia 1.099,60
Total 109,60`;

it('lê crédito, débito e data curta, e ignora saldo e total', () => {
  const rows = parseStatementText(statement);
  expect(rows.map(row => [row.date, row.description, row.amount])).toEqual([
    ['2026-10-01', 'PIX Recebido', 15000],
    ['2026-10-02', 'Mercado', -4590],
    ['2026-10-03', 'Tarifa', -450],
  ]);
});

it('junta colunas da mesma linha e mantém a página seguinte', () => {
  const text = textFromPdfItems([[
    { str: '04/10/2026', x: 40, y: 400, width: 70 },
    { str: 'Padaria', x: 140, y: 400, width: 50 },
    { str: '12,30', x: 280, y: 401, width: 30 },
    { str: 'D', x: 320, y: 400, width: 8 },
  ], [
    { str: '05/10/2026', x: 40, y: 500, width: 70 },
    { str: 'Salário', x: 140, y: 500, width: 40 },
    { str: 'R$ 1.000,00', x: 250, y: 500, width: 70 },
    { str: 'C', x: 330, y: 500, width: 8 },
  ]]);
  expect(parseStatementText(text).map(row => [row.description, row.amount])).toEqual([['Padaria', -1230], ['Salário', 100000]]);
});

const invoice = `Fatura fechada em 09/09/2026
OUROCARD
01- AMANDA J D SILVA Cartao N. 7928
21/08 COMPRA DA AMANDA R$ 10,00
13/08 ESTORNO ANUIDADE R$ 3,00-
Subtotal R$ 7,00
02- RAFAEL A D SANTOS Cartao N. 5919
15/08 COMPRA DO RAFAEL R$ 20,00
21/08 CREDITO LOJA R$ 5,00-
Subtotal R$ 15,00
Total R$ 22,00`;

it('mostra só a parte do nome do perfil numa fatura com vários cartões', () => {
  expect(invoiceCardholders(invoice)).toEqual(['AMANDA J D SILVA', 'RAFAEL A D SANTOS']);
  expect(parseStatementText(invoice, 'Rafael Santos').map(row => [row.description, row.amount])).toEqual([['COMPRA DO RAFAEL', -2000], ['CREDITO LOJA', 500]]);
  expect(parseStatementText(invoice, 'Amanda').map(row => row.description)).toEqual(['COMPRA DA AMANDA', 'ESTORNO ANUIDADE']);
  expect(() => parseStatementText(invoice, '')).toThrow(/perfil/);
  expect(() => parseStatementText(invoice, 'Carlos')).toThrow(/Carlos/);
});

it('prioriza o primeiro nome mesmo quando outros nomes do perfil não estão na fatura', () => {
  expect(parseStatementText(invoice, 'Rafael Pereira').map(row => row.description)).toEqual(['COMPRA DO RAFAEL', 'CREDITO LOJA']);
  expect(parseStatementText(invoice, 'Amanda Rafael').map(row => row.description)).toEqual(['COMPRA DA AMANDA', 'ESTORNO ANUIDADE']);
});

it('tenta o segundo e os nomes seguintes quando os anteriores não são encontrados', () => {
  expect(parseStatementText(invoice, 'Carlos Rafael').map(row => row.description)).toEqual(['COMPRA DO RAFAEL', 'CREDITO LOJA']);
  expect(parseStatementText(invoice, 'Carlos de Pedro Ámanda').map(row => row.description)).toEqual(['COMPRA DA AMANDA', 'ESTORNO ANUIDADE']);
  expect(() => parseStatementText(invoice, 'Rafa')).toThrow(/não encontrei/i);
});

it('desambigua nomes repetidos sem misturar titulares diferentes', () => {
  const repeated = invoice.replace('AMANDA J D SILVA', 'RAFAEL SILVA');
  expect(parseStatementText(repeated, 'Rafael Santos').map(row => row.description)).toEqual(['COMPRA DO RAFAEL', 'CREDITO LOJA']);
  expect(() => parseStatementText(repeated, 'Rafael')).toThrow(/mais de um titular/i);
  expect(() => parseStatementText(repeated, 'Carlos de')).toThrow(/não encontrei/i);
});

it('mantém todos os cartões do mesmo titular identificado', () => {
  const same = invoice.replace('AMANDA J D SILVA', 'RAFAEL A D SANTOS');
  expect(parseStatementText(same, 'Rafael').map(row => row.description)).toEqual(['COMPRA DA AMANDA', 'ESTORNO ANUIDADE', 'COMPRA DO RAFAEL', 'CREDITO LOJA']);
});

it('recusa foto sem texto, layout desconhecido e extrato longo demais', () => {
  expect(() => parseStatementText('apenas um comprovante sem tabela')).toThrow(/foto/);
  expect(() => parseStatementText(Array.from({ length: 501 }, (_, i) => `01/10/2026 Compra ${i} 1,00`).join('\n'))).toThrow(/500/);
});

it('grava a origem do PDF para a reimportação não duplicar', () => {
  const rows = parseStatementText('01/10/2026 PIX Recebido 10,00 C');
  expect(importEntries(rows, 'a', 'hash', () => 'id', 'pdf')[0].sourceKey).toBe('pdf:hash:1');
});

function samplePdf(lines: string[]) {
  const stream = ['BT /F1 11 Tf 40 460 Td', ...lines.flatMap((line, index) => [`${index ? '0 -18 Td ' : ''}(${line}) Tj`]), 'ET'].join('\n');
  let body = '%PDF-1.4\n';
  const offsets = [0];
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 520] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];
  for (const object of objects) { offsets.push(body.length); body += object; }
  const xrefAt = body.length;
  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (let index = 1; index <= 5; index++) xref += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  return new TextEncoder().encode(`${body}${xref}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`);
}

it('extrai um PDF de texto no dispositivo', async () => {
  const text = await readPdfText(samplePdf(['01/10/2026 PIX Recebido 150,00 C', '02/10/2026 Mercado -45,90', 'Saldo anterior 1.000,00']));
  expect(parseStatementText(text).map(row => row.amount)).toEqual([15000, -4590]);
});

it('separa os cartões da fatura Ourocard quando o arquivo de exemplo está presente', async () => {
  const path = 'OUROCARD MASTERCARD BLACK (1)_unlocked.pdf';
  if (!existsSync(path)) return;
  const text = await readPdfText(new Uint8Array(readFileSync(path)));
  const holders = invoiceCardholders(text);
  expect(holders.length).toBeGreaterThan(1);
  const parts = holders.map(name => parseStatementText(text, name.split(' ')[0]));
  const fallbackParts = holders.map(name => parseStatementText(text, `NomeInexistente ${name.split(' ')[0]}`));
  expect(fallbackParts.every((rows, index) => rows.length === parts[index].length)).toBe(true);
  expect(parts.every(rows => rows.length > 0 && rows.some(row => row.amount < 0) && rows.every(row => !/subtotal|^total\b/i.test(row.description)))).toBe(true);
  expect(new Set(parts.map(rows => rows.length)).size).toBe(holders.length);
});

it('recusa arquivo que não é PDF', async () => {
  await expect(readPdfText(new TextEncoder().encode('nao e pdf'))).rejects.toThrow(/não reconhecido/);
});
