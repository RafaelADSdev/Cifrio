import { expect, it } from 'vitest';
import { importEntries, mapCsv, parseOfx, splitCsv } from '../src/domain/imports';
it('lê BOM, aspas escapadas, descrição multilinha e vírgula decimal', () => {
  const preview = splitCsv('\uFEFFdata;descricao;valor\r\n01/10/2026;"Loja ""Centro""\nCompra";-12,30');
  const rows = mapCsv(preview, { date: 0, description: 1, amount: 2 });
  expect(rows[0]).toMatchObject({ date: '2026-10-01', description: 'Loja "Centro"\nCompra', amount: -1230 });
});
it('marca linha inválida e rejeita aspas abertas', () => {
  expect(mapCsv(splitCsv('data;descricao;valor\n31/02/2026;Teste;10'), { date: 0, description: 1, amount: 2 })[0].error).toBeTruthy();
  expect(() => splitCsv('a,b\n"bad,1')).toThrow();
});
it('preserva FITID e valor exato em OFX SGML', () => {
  const rows = parseOfx('<OFX><STMTTRN><DTPOSTED>20261001120000[-3:BRT]\n<TRNAMT>-10.01\n<FITID>ABC\n<MEMO>Compra\n</STMTTRN></OFX>');
  expect(importEntries(rows, 'a', 'hash', () => 'id')[0]).toMatchObject({ amount: 1001, date: '2026-10-01', kind: 'expense', sourceKey: 'ofx:ABC' });
});
it('preserva duas linhas iguais e identidade de reimportação', () => {
  const rows = mapCsv(splitCsv('data;descricao;valor\n01/10/2026;Compra;-10\n01/10/2026;Compra;-10'), { date: 0, description: 1, amount: 2 });
  const entries = importEntries(rows, 'a', 'hash', () => 'id');
  expect(entries[0].sourceKey).not.toBe(entries[1].sourceKey);
  expect(importEntries(rows, 'a', 'hash', () => 'new')[0].sourceKey).toBe(entries[0].sourceKey);
});
