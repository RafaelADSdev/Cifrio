import { installmentsFor, monthlySummary, statement } from './finance';
import { Budget, Card, categories, CategoryRule, Entry, FinanceState } from './model';
import { addMonth } from './money';

export function statementDueDate(statementMonth: string, card: Card) {
  const dueMonth = card.dueDay <= card.closingDay ? addMonth(statementMonth, 1) : statementMonth;
  const [year, month] = dueMonth.split('-').map(Number);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(card.dueDay, last);
  return `${dueMonth}-${String(day).padStart(2, '0')}`;
}

export function cashLeftAccounts(state: FinanceState, month: string) {
  return state.entries.reduce((sum, entry) => entry.date.startsWith(month) && (entry.kind === 'expense' || entry.kind === 'card_payment') ? sum + entry.amount : sum, 0);
}
export function monthReadings(state: FinanceState, month: string) {
  const summary = monthlySummary(state, month);
  return { income: summary.income, spent: summary.expense, cashOut: cashLeftAccounts(state, month), result: summary.result };
}
export type AgendaItem = { cardId: string; cardName: string; dueDay: number; dueDate: string; description: string; amount: number; index: number; count: number; entryId: string };
export type AgendaMonth = { month: string; total: number; remaining: number; items: AgendaItem[] };
export type InstallmentProgress = { description: string; cardName: string; total: number; paidInstallments: number; remainingInstallments: number; parts: { month: string; amount: number; index: number; paid: boolean }[] };
export function installmentProgress(state: FinanceState, entryId: string): InstallmentProgress | null {
  const entry = state.entries.find(item => item.id === entryId && item.kind === 'card_purchase');
  if (!entry?.cardId) return null;
  const card = state.cards.find(item => item.id === entry.cardId);
  if (!card) return null;
  const parts = installmentsFor(entry, card).map(part => ({
    month: part.month,
    amount: part.amount,
    index: part.index,
    paid: statement(state, entry.cardId!, part.month).remaining === 0,
  }));
  const paidInstallments = parts.filter(part => part.paid).length;
  return {
    description: entry.description,
    cardName: card.name,
    total: parts.length,
    paidInstallments,
    remainingInstallments: parts.length - paidInstallments,
    parts,
  };
}
export function agendaItemsByDueMonth(state: FinanceState, calendarMonth: string): AgendaItem[] {
  const items: AgendaItem[] = [];
  for (const card of state.cards) {
    for (const entry of state.entries) {
      if (entry.kind !== 'card_purchase' || entry.cardId !== card.id) continue;
      for (const part of installmentsFor(entry, card)) {
        const dueDate = statementDueDate(part.month, card);
        if (!dueDate.startsWith(calendarMonth)) continue;
        items.push({
          cardId: card.id,
          cardName: card.name,
          dueDay: card.dueDay,
          dueDate,
          description: entry.description,
          amount: part.amount,
          index: part.index,
          count: part.count,
          entryId: entry.id,
        });
      }
    }
  }
  return items.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.description.localeCompare(b.description));
}
export function monthlyDueLoad(state: FinanceState, calendarMonth: string) {
  const committed = agendaItemsByDueMonth(state, calendarMonth).reduce((sum, item) => sum + item.amount, 0);
  const limit = state.cards.reduce((sum, card) => sum + card.limit, 0);
  return { committed, limit, over: limit > 0 && committed > limit };
}
export function agendaForMonth(state: FinanceState, month: string): AgendaMonth {
  const bills = state.cards.map(card => ({ card, bill: statement(state, card.id, month) }));
  const items = bills.flatMap(({ card, bill }) => bill.items.map(item => ({
    cardId: card.id,
    cardName: card.name,
    dueDay: card.dueDay,
    dueDate: statementDueDate(month, card),
    description: item.entry.description,
    amount: item.amount,
    index: item.index,
    count: item.count,
    entryId: item.entry.id,
  })));
  return {
    month,
    total: items.reduce((sum, item) => sum + item.amount, 0),
    remaining: bills.reduce((sum, { bill }) => sum + bill.remaining, 0),
    items,
  };
}
export function installmentAgenda(state: FinanceState, fromMonth: string, horizon = 6): AgendaMonth[] {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(fromMonth) || !Number.isInteger(horizon) || horizon < 1 || horizon > 24) return [];
  const months: AgendaMonth[] = [];
  for (let offset = 0; offset < horizon; offset++) {
    const row = agendaForMonth(state, addMonth(fromMonth, offset));
    if (row.items.length) months.push(row);
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
export type SpendingSlice = { category: string; amount: number; share: number };
export function spendingBreakdown(state: FinanceState, month: string): { total: number; slices: SpendingSlice[] } {
  const summary = monthlySummary(state, month);
  const slices = Object.entries(summary.byCategory)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({ category, amount, share: summary.expense ? amount / summary.expense : 0 }))
    .sort((a, b) => b.amount - a.amount);
  return { total: summary.expense, slices };
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
