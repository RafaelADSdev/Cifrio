import { describe, expect, it } from 'vitest';
import { balance, insertEntries, installmentsFor, monthlySummary, statement } from '../src/domain/finance';
import { Entry, FinanceState } from '../src/domain/model';
const state: FinanceState = { accounts: [{ id: 'a', name: 'BB', bank: 'BB', openingBalance: 100000 }, { id: 'b', name: 'Inter', bank: 'Inter', openingBalance: 0 }], cards: [{ id: 'c', name: 'Cartão', closingDay: 10, dueDay: 17, limit: 500000 }], entries: [] };
const entry = (changes: Partial<Entry>): Entry => ({ id: 'e', kind: 'expense', accountId: 'a', amount: 1000, date: '2026-10-01', description: 'Teste', category: 'Compras', method: 'pix', ...changes });
describe('núcleo financeiro', () => {
  it('transferência conserva patrimônio e não entra no relatório', () => {
    const next = insertEntries(state, [entry({ kind: 'transfer', destinationId: 'b' })]);
    expect(balance(next, 'a')).toBe(99000); expect(balance(next, 'b')).toBe(1000);
    expect(monthlySummary(next, '2026-10').expense).toBe(0);
  });
  it('distribui resto de centavos sem perder valor', () => {
    const parts = installmentsFor(entry({ amount: 10000, installments: 3 }), state.cards[0]);
    expect(parts.map(p => p.amount)).toEqual([3334, 3333, 3333]);
    expect(parts.map(p => p.month)).toEqual(['2026-10', '2026-11', '2026-12']);
  });
  it('compra no fechamento vai para próxima competência, incluindo ano novo', () => {
    expect(installmentsFor(entry({ date: '2026-12-10', installments: 1 }), state.cards[0])[0].month).toBe('2027-01');
  });
  it('pagamentos parciais quitam obrigação sem duplicar despesa', () => {
    const purchase = entry({ kind: 'card_purchase', accountId: undefined, cardId: 'c', installments: 1 });
    const next = insertEntries(state, [purchase, entry({ id: 'p', kind: 'card_payment', cardId: 'c', amount: 400, statementMonth: '2026-10' }), entry({ id: 'p2', kind: 'card_payment', cardId: 'c', amount: 600, statementMonth: '2026-10' })]);
    expect(statement(next, 'c', '2026-10').remaining).toBe(0);
    expect(balance(next, 'a')).toBe(99000); expect(monthlySummary(next, '2026-10').expense).toBe(1000);
  });
  it('reenvio e fonte externa estável são idempotentes', () => {
    const e = entry({ sourceKey: 'FITID-1' });
    expect(insertEntries(insertEntries(state, [e]), [e, { ...e, id: 'other' }]).entries).toHaveLength(1);
  });
  it('duas compras legítimas iguais são preservadas', () => {
    expect(insertEntries(state, [entry({ id: '1' }), entry({ id: '2' })]).entries).toHaveLength(2);
  });
  it('lote inválido não altera o estado original', () => {
    expect(() => insertEntries(state, [entry({ id: '1' }), entry({ id: '2', accountId: 'unknown' })])).toThrow();
    expect(state.entries).toHaveLength(0);
  });
  it('rejeita transferência própria e pagamento acima da fatura', () => {
    expect(() => insertEntries(state, [entry({ kind: 'transfer', destinationId: 'a' })])).toThrow();
    expect(() => insertEntries(state, [entry({ kind: 'card_payment', cardId: 'c', statementMonth: '2026-10' })])).toThrow();
  });
});
