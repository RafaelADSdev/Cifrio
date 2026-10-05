import { monthlySummary, statement } from './finance';
import { Budget, categories, CategoryRule, Entry, FinanceState } from './model';
import { addMonth } from './money';

export function cashLeftAccounts(state: FinanceState, month: string) {
  return state.entries.reduce((sum, entry) => entry.date.startsWith(month) && (entry.kind === 'expense' || entry.kind === 'card_payment') ? sum + entry.amount : sum, 0);
}
export function monthReadings(state: FinanceState, month: string) {
  const summary = monthlySummary(state, month);
  return { income: summary.income, spent: summary.expense, cashOut: cashLeftAccounts(state, month), result: summary.result };
}
export type AgendaItem = { cardName: string; dueDay: number; description: string; amount: number; index: number; count: number; entryId: string };
export type AgendaMonth = { month: string; total: number; remaining: number; items: AgendaItem[] };
export function installmentAgenda(state: FinanceState, fromMonth: string, horizon = 6): AgendaMonth[] {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(fromMonth) || !Number.isInteger(horizon) || horizon < 1 || horizon > 24) return [];
  const months: AgendaMonth[] = [];
  for (let offset = 0; offset < horizon; offset++) {
    const month = addMonth(fromMonth, offset);
    const bills = state.cards.map(card => ({ card, bill: statement(state, card.id, month) }));
    const items = bills.flatMap(({ card, bill }) => bill.items.map(item => ({ cardName: card.name, dueDay: card.dueDay, description: item.entry.description, amount: item.amount, index: item.index, count: item.count, entryId: item.entry.id })));
    if (!items.length) continue;
    months.push({ month, total: items.reduce((sum, item) => sum + item.amount, 0), remaining: bills.reduce((sum, { bill }) => sum + bill.remaining, 0), items });
  }
  return months;
}
export function upsertBudget(budgets: Budget[] | undefined, budget: Budget): Budget[] {
  const category = budget?.category?.trim?.() ?? '';
  if (!categories.some(item => item === category)) throw new Error('Escolha uma categoria.');
  if (!Number.isSafeInteger(budget.limit) || budget.limit < 0) throw new Error('Informe um limite válido.');
  const rest = (budgets ?? []).filter(item => item.category !== category);
  return budget.limit === 0 ? rest : [...rest, { category, limit: budget.limit }];
}
export function budgetStatus(state: FinanceState, month: string) {
  const spent = monthlySummary(state, month).byCategory;
  const budgets = state.budgets ?? [];
  return [...new Set([...budgets.map(item => item.category), ...Object.keys(spent)])].map(category => {
    const limit = budgets.find(item => item.category === category)?.limit ?? 0;
    const used = spent[category] ?? 0;
    return { category, used, limit, over: limit > 0 && used > limit };
  }).sort((a, b) => Number(b.over) - Number(a.over) || b.used - a.used);
}
export function descriptionKey(description: string) {
  return description.trim().toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ');
}
export function rememberCategory(rules: CategoryRule[] | undefined, description: string, category: string): CategoryRule[] {
  const key = descriptionKey(description);
  const current = rules ?? [];
  if (!key) return current;
  const rest = current.filter(rule => rule.key !== key);
  return category === 'Outros' || !categories.some(item => item === category) ? rest : [...rest, { key, category }];
}
export function suggestCategory(rules: CategoryRule[] | undefined, description: string) {
  const key = descriptionKey(description);
  return key ? (rules ?? []).find(rule => rule.key === key)?.category : undefined;
}
export function rememberFromEntry(rules: CategoryRule[] | undefined, entry: Entry, forgetOutros = false): CategoryRule[] {
  if (entry.kind === 'transfer' || entry.kind === 'card_payment') return rules ?? [];
  if (entry.category === 'Outros' && !forgetOutros) return rules ?? [];
  return rememberCategory(rules, entry.description, entry.category);
}
