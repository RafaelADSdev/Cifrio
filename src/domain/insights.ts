import { monthlySummary } from './finance';
import { Entry, EntryKind, FinanceState } from './model';
import { addMonth } from './money';

export const entryLabels: Record<EntryKind, string> = { income: 'Receita', expense: 'Despesa', transfer: 'Transferência', card_purchase: 'Compra no cartão', card_payment: 'Pagamento de fatura' };
export type EntryFilters = { search?: string; account?: string; card?: string; kind?: string; month?: string };
const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
export function filterEntries(state: FinanceState, filters: EntryFilters = {}): Entry[] {
  const query = normalized(filters.search ?? '');
  return state.entries.filter(entry => {
    const accountName = state.accounts.find(account => account.id === entry.accountId)?.name ?? '';
    const destinationName = state.accounts.find(account => account.id === entry.destinationId)?.name ?? '';
    const cardName = state.cards.find(card => card.id === entry.cardId)?.name ?? '';
    return (!filters.account || filters.account === 'all' || entry.accountId === filters.account || entry.destinationId === filters.account)
      && (!filters.card || filters.card === 'all' || entry.cardId === filters.card)
      && (!filters.kind || filters.kind === 'all' || entry.kind === filters.kind)
      && (!filters.month || filters.month === 'all' || entry.date.startsWith(filters.month))
      && normalized([entry.description, entry.category, entry.method, entry.date, entryLabels[entry.kind], accountName, destinationName, cardName].join(' ')).includes(query);
  }).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}
export function monthlyInsights(state: FinanceState, month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Selecione um mês válido.');
  const current = monthlySummary(state, month), previous = monthlySummary(state, addMonth(month, -1));
  const trend = Array.from({ length: 6 }, (_, index) => {
    const period = addMonth(month, index - 5), summary = monthlySummary(state, period);
    return { month: period, income: summary.income, expense: summary.expense, result: summary.result };
  });
  const breakdown = Object.entries(current.byCategory).sort((a, b) => b[1] - a[1]).map(([category, amount]) => ({ category, amount, ratio: current.expense > 0 ? amount / current.expense : 0 }));
  return { current, previous, trend, breakdown, expenseChange: current.expense - previous.expense, expenseChangePercent: previous.expense > 0 ? (current.expense - previous.expense) / previous.expense * 100 : null };
}
