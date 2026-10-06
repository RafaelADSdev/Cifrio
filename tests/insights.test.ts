import { expect, it } from 'vitest';
import { filterEntries, monthlyInsights } from '../src/domain/insights';
import { Entry, FinanceState } from '../src/domain/model';

const entry = (change: Partial<Entry>): Entry => ({ id: 'e', kind: 'expense', accountId: 'a', amount: 6000, date: '2026-10-01', description: 'Café', category: 'Alimentação', method: 'pix', ...change });
const state: FinanceState = { accounts: [{ id: 'a', name: 'Conta diária', bank: 'BB', openingBalance: 0 }, { id: 'b', name: 'Reserva', bank: 'Inter', openingBalance: 0 }], cards: [{ id: 'c', name: 'Cartão', closingDay: 10, dueDay: 17, limit: 500000 }], entries: [
  entry({ id: 'prior', date: '2026-09-01', amount: 4000 }),
  entry({ id: 'income', kind: 'income', amount: 20000, category: 'Salário' }),
  entry({}),
  entry({ id: 'transfer', kind: 'transfer', destinationId: 'b', amount: 5000 }),
  entry({ id: 'purchase', kind: 'card_purchase', accountId: undefined, cardId: 'c', amount: 10000, installments: 3, category: 'Compras' }),
  entry({ id: 'payment', kind: 'card_payment', cardId: 'c', amount: 1000, statementMonth: '2026-10' }),
] };
it('estatísticas contam parcelas em centavos sem duplicar transferências e pagamentos', () => {
  const data = monthlyInsights(state, '2026-10');
  expect(data.current).toMatchObject({ income: 20000, expense: 9334, result: 10666 });
  expect(data.previous.expense).toBe(4000);
  expect(data.expenseChange).toBe(5334);
  expect(data.trend.map(item => item.month)).toEqual(['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10']);
  expect(data.breakdown.reduce((sum, row) => sum + row.amount, 0)).toBe(9334);
  expect(data.breakdown.reduce((sum, row) => sum + row.ratio, 0)).toBeCloseTo(1);
});
it('não cria percentuais infinitos nem dados fictícios no estado vazio e vira o ano', () => {
  const data = monthlyInsights({ accounts: [], cards: [], entries: [] }, '2027-01');
  expect(data.expenseChangePercent).toBeNull();
  expect(data.breakdown).toEqual([]);
  expect(data.trend[0].month).toBe('2026-08');
  expect(data.trend.every(row => row.income === 0 && row.expense === 0)).toBe(true);
  expect(() => monthlyInsights(state, '2026-13')).toThrow();
});
it('combina filtros e encontra a conta de destino, cartões e palavras sem acento', () => {
  expect(filterEntries(state, { account: 'b' }).map(row => row.id)).toEqual(['transfer']);
  expect(filterEntries(state, { card: 'c', kind: 'card_purchase', month: '2026-10', search: 'cartao' }).map(row => row.id)).toEqual(['purchase']);
  expect(filterEntries(state, { kind: 'expense', month: '2026-10', search: 'cafe' }).map(row => row.id)).toEqual(['e']);
  expect(filterEntries(state, { search: 'diaria', kind: 'income' }).map(row => row.id)).toEqual(['income']);
  expect(filterEntries(state, { account: 'b', kind: 'income' })).toEqual([]);
  expect(state.entries[0].id).toBe('prior');
});
