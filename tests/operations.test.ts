import { expect, it } from 'vitest';
import { applyOperation } from '../src/domain/operations';
import { FinanceState } from '../src/domain/model';
it('blocks deletion/edit of purchase whose invoice is already paid', () => {
  const state: FinanceState = { accounts: [{ id: 'a', name: 'BB', bank: 'BB', openingBalance: 0 }], cards: [{ id: 'c', name: 'Cartão', limit: 100000, closingDay: 10, dueDay: 17 }], entries: [
    { id: 'buy', kind: 'card_purchase', cardId: 'c', amount: 1000, installments: 1, date: '2026-10-01', category: 'Outros', description: 'Compra', method: 'credit' },
    { id: 'pay', kind: 'card_payment', cardId: 'c', accountId: 'a', amount: 1000, statementMonth: '2026-10', date: '2026-10-02', category: 'Outros', description: 'Pagamento', method: 'pix' },
  ] };
  expect(() => applyOperation(state, { id: 'op', action: 'delete', records: [{ id: 'buy' }] })).toThrow();
  expect(() => applyOperation(state, { id: 'op', action: 'edit', records: [{ ...state.entries[0], amount: 500 }] })).toThrow();
  expect(state.entries).toHaveLength(2);
});
