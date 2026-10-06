import { expect, it } from 'vitest';
import { applyOperation } from '../src/domain/operations';
import { hydrateState } from '../src/domain/model';
import { Entry, FinanceState } from '../src/domain/model';
import { budgetStatus, installmentAgenda, installmentProgress, monthReadings, spendingBreakdown, statementDueDate, suggestCategory } from '../src/domain/planning';
import { statement } from '../src/domain/finance';
import { importEntries } from '../src/domain/imports';

const state: FinanceState = { accounts: [{ id: 'a', name: 'BB', bank: 'BB', openingBalance: 100000 }], cards: [{ id: 'c', name: 'Cartão', closingDay: 10, dueDay: 17, limit: 500000 }], entries: [] };
const entry = (changes: Partial<Entry>): Entry => ({ id: 'e', kind: 'expense', accountId: 'a', amount: 1000, date: '2026-10-01', description: 'Mercado', category: 'Alimentação', method: 'pix', ...changes });

it('separa gasto da fatura do dinheiro que saiu da conta', () => {
  const next = { ...state, entries: [entry({ amount: 6000 }), entry({ id: 't', kind: 'transfer', destinationId: 'a', amount: 1000 }), entry({ id: 'buy', kind: 'card_purchase', accountId: undefined, cardId: 'c', amount: 3000, installments: 1, category: 'Compras', description: 'Loja' }), entry({ id: 'pay', kind: 'card_payment', cardId: 'c', amount: 1000, statementMonth: '2026-10', date: '2026-10-20', description: 'Fatura' })] };
  const readings = monthReadings(next, '2026-10');
  expect(readings.spent).toBe(9000);
  expect(readings.cashOut).toBe(7000);
});

it('projeta parcelas futuras e manda compra no fechamento para o mês seguinte', () => {
  const bought = { ...state, entries: [entry({ id: 'buy', kind: 'card_purchase', accountId: undefined, cardId: 'c', amount: 10000, installments: 3, date: '2026-10-10', description: 'Sofá' })] };
  const agenda = installmentAgenda(bought, '2026-10', 4);
  expect(agenda.map(month => month.month)).toEqual(['2026-11', '2026-12', '2027-01']);
  expect(agenda[0]).toMatchObject({ total: 3334, remaining: 3334 });
  expect(agenda[0].items[0]).toMatchObject({ description: 'Sofá', index: 1, count: 3, dueDay: 17, dueDate: statementDueDate('2026-11', state.cards[0]) });
});

it('conta parcelas pagas quando a fatura do mês está quitada', () => {
  const bought = { ...state, entries: [entry({ id: 'buy', kind: 'card_purchase', accountId: undefined, cardId: 'c', amount: 9000, installments: 3, date: '2026-10-10', description: 'Sofá' })] };
  expect(installmentProgress(bought, 'buy')).toMatchObject({ total: 3, paidInstallments: 0, remainingInstallments: 3 });
  const paidFirst = { ...bought, entries: [...bought.entries, entry({ id: 'pay', kind: 'card_payment', accountId: 'a', cardId: 'c', amount: statement(bought, 'c', '2026-11').total, statementMonth: '2026-11', date: '2026-11-17', description: 'Fatura' })] };
  expect(installmentProgress(paidFirst, 'buy')).toMatchObject({ paidInstallments: 1, remainingInstallments: 2 });
});

it('monta o gráfico de gastos por categoria com percentuais', () => {
  const next = { ...state, entries: [entry({ amount: 4000, category: 'Alimentação' }), entry({ id: 'b', amount: 6000, category: 'Transporte', description: 'Uber' })] };
  const chart = spendingBreakdown(next, '2026-10');
  expect(chart.total).toBe(10000);
  expect(chart.slices.map(slice => slice.category)).toEqual(['Transporte', 'Alimentação']);
  expect(chart.slices[0]).toMatchObject({ amount: 6000, share: 0.6 });
});

it('mede o limite pela parcela da fatura, não pela data da compra', () => {
  const bought = { ...state, budgets: [{ category: 'Compras', limit: 2000 }], entries: [entry({ id: 'buy', kind: 'card_purchase', accountId: undefined, cardId: 'c', amount: 3000, installments: 1, date: '2026-10-10', category: 'Compras', description: 'Loja' })] };
  expect(budgetStatus(bought, '2026-10').find(item => item.category === 'Compras')).toMatchObject({ used: 0, over: false });
  expect(budgetStatus(bought, '2026-11').find(item => item.category === 'Compras')).toMatchObject({ used: 3000, limit: 2000, over: true });
});

it('grava, substitui e remove limite sem perder centavos', () => {
  const saved = applyOperation(state, { id: '1', action: 'budget', records: [{ category: 'Alimentação', limit: 15000 }] });
  const replaced = applyOperation(saved, { id: '2', action: 'budget', records: [{ category: 'Alimentação', limit: 8000 }] });
  expect(replaced.budgets).toEqual([{ category: 'Alimentação', limit: 8000 }]);
  expect(applyOperation(replaced, { id: '3', action: 'budget', records: [{ category: 'Alimentação', limit: 0 }] }).budgets).toEqual([]);
  expect(() => applyOperation(state, { id: '4', action: 'budget', records: [{ category: 'Viagem', limit: 100 }] })).toThrow();
});

it('lembra a categoria no aparelho e não apaga a sugestão numa importação sem classificação', () => {
  const learned = applyOperation(state, { id: '1', action: 'entries', records: [entry({ description: '  MERCADO   da semana ' })] });
  expect(suggestCategory(learned.categoryMemory, 'mercado da semana')).toBe('Alimentação');
  const imported = applyOperation(learned, { id: '2', action: 'entries', records: [entry({ id: 'i', description: 'Mercado da semana', category: 'Outros', sourceKey: 'csv:1' })] });
  expect(suggestCategory(imported.categoryMemory, 'Mercado da semana')).toBe('Alimentação');
  const cleared = applyOperation(imported, { id: '3', action: 'edit', records: [{ ...imported.entries[0], category: 'Outros' }] });
  expect(suggestCategory(cleared.categoryMemory, 'mercado da semana')).toBeUndefined();
});

it('aceita categoria revisada na importação e ignora categoria desconhecida', () => {
  const known = importEntries([{ line: 2, date: '2026-10-01', description: 'Padaria', amount: -1000, category: 'Alimentação' }], 'a', 'hash', () => 'id');
  const unknown = importEntries([{ line: 2, date: '2026-10-01', description: 'Padaria', amount: -1000, category: 'Viagem' }], 'a', 'hash', () => 'id');
  expect(known[0].category).toBe('Alimentação');
  expect(unknown[0].category).toBe('Outros');
});

it('reidrata registros antigos sem limites nem memória', () => {
  expect(hydrateState({ accounts: state.accounts, cards: [], entries: [] })).toMatchObject({ budgets: [], categoryMemory: [], accounts: state.accounts });
  expect(hydrateState(null)).toMatchObject({ accounts: [], budgets: [], categoryMemory: [] });
});
