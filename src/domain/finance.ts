import { Account, Card, Entry, FinanceState } from './model';
import { addMonth, assertDate } from './money';

export function validateAccount(account: Account) {
  if (!account.id || !account.name.trim() || !account.bank.trim() || !Number.isSafeInteger(account.openingBalance)) throw new Error('Revise o nome e o saldo inicial da conta.');
}
export function validateCard(card: Card) {
  if (!card.id || !card.name.trim() || !Number.isInteger(card.closingDay) || !Number.isInteger(card.dueDay) || card.closingDay < 1 || card.closingDay > 28 || card.dueDay < 1 || card.dueDay > 28 || !Number.isSafeInteger(card.limit) || card.limit <= 0) throw new Error('Informe nome, limite e dias entre 1 e 28.');
}
export function validateEntry(state: FinanceState, entry: Entry) {
  assertDate(entry.date);
  if (!entry.id || !entry.description.trim() || !entry.category.trim() || !Number.isSafeInteger(entry.amount) || entry.amount <= 0) throw new Error('Informe descrição, categoria e valor maior que zero.');
  if (!['income', 'expense', 'transfer', 'card_purchase', 'card_payment'].includes(entry.kind)) throw new Error('Tipo de movimentação inválido.');
  if (!['pix', 'debit', 'cash', 'credit'].includes(entry.method)) throw new Error('Forma de pagamento inválida.');
  if (entry.kind !== 'card_purchase' && !state.accounts.some(a => a.id === entry.accountId)) throw new Error('Selecione uma conta válida.');
  if (entry.kind === 'transfer' && (entry.destinationId === entry.accountId || !state.accounts.some(a => a.id === entry.destinationId))) throw new Error('Escolha outra conta como destino.');
  if (entry.kind.startsWith('card_') && !state.cards.some(c => c.id === entry.cardId)) throw new Error('Selecione um cartão válido.');
  if (entry.kind === 'card_purchase' && (!Number.isInteger(entry.installments) || entry.installments! < 1 || entry.installments! > 48 || entry.installments! > entry.amount)) throw new Error('Use entre 1 e 48 parcelas, de pelo menos um centavo.');
  if (entry.kind === 'card_payment' && (!entry.statementMonth || !/^\d{4}-(0[1-9]|1[0-2])$/.test(entry.statementMonth))) throw new Error('Selecione a competência da fatura.');
}
export function firstStatementMonth(entry: Entry, card: Card) {
  return addMonth(entry.date.slice(0, 7), Number(entry.date.slice(8)) >= card.closingDay ? 1 : 0);
}
export function installmentsFor(entry: Entry, card: Card) {
  const count = entry.installments ?? 1;
  const base = Math.floor(entry.amount / count), remainder = entry.amount % count;
  return Array.from({ length: count }, (_, i) => ({ month: addMonth(firstStatementMonth(entry, card), i), amount: base + (i < remainder ? 1 : 0), index: i + 1, count, entry }));
}
export function statement(state: FinanceState, cardId: string, month: string) {
  const card = state.cards.find(c => c.id === cardId);
  if (!card) return { total: 0, paid: 0, remaining: 0, items: [] as ReturnType<typeof installmentsFor> };
  const items = state.entries.filter(e => e.kind === 'card_purchase' && e.cardId === cardId).flatMap(e => installmentsFor(e, card)).filter(p => p.month === month);
  const total = items.reduce((s, p) => s + p.amount, 0);
  const paid = state.entries.filter(e => e.kind === 'card_payment' && e.cardId === cardId && e.statementMonth === month).reduce((s, e) => s + e.amount, 0);
  return { total, paid, remaining: total - paid, items };
}
export function balance(state: FinanceState, accountId: string) {
  return (state.accounts.find(a => a.id === accountId)?.openingBalance ?? 0) + state.entries.reduce((sum, e) => {
    if (e.kind === 'card_purchase') return sum;
    if (e.kind === 'transfer' && e.destinationId === accountId) return sum + e.amount;
    if (e.accountId !== accountId) return sum;
    return sum + (e.kind === 'income' ? e.amount : -e.amount);
  }, 0);
}
export function monthlySummary(state: FinanceState, month: string) {
  const cash = state.entries.filter(e => e.date.startsWith(month) && (e.kind === 'income' || e.kind === 'expense'));
  const income = cash.filter(e => e.kind === 'income').reduce((s, e) => s + e.amount, 0);
  const expenses = cash.filter(e => e.kind === 'expense').map(e => ({ amount: e.amount, category: e.category }));
  const cardExpenses = state.cards.flatMap(c => statement(state, c.id, month).items.map(p => ({ amount: p.amount, category: p.entry.category })));
  const byCategory = [...expenses, ...cardExpenses].reduce<Record<string, number>>((acc, e) => { acc[e.category] = (acc[e.category] ?? 0) + e.amount; return acc; }, {});
  const expense = Object.values(byCategory).reduce((s, n) => s + n, 0);
  return { income, expense, result: income - expense, byCategory, available: state.accounts.reduce((s, a) => s + balance(state, a.id), 0) };
}
// Pure mutation: validation happens before a new state is returned, making batches atomic.
export function insertEntries(state: FinanceState, entries: Entry[]): FinanceState {
  let next = { ...state, entries: [...state.entries] };
  for (const entry of entries) {
    if (next.entries.some(e => e.id === entry.id || (entry.sourceKey && e.sourceKey === entry.sourceKey && e.accountId === entry.accountId))) continue;
    validateEntry(next, entry);
    if (entry.kind === 'card_payment' && entry.amount > statement(next, entry.cardId!, entry.statementMonth!).remaining) throw new Error('Pagamento maior que o saldo da fatura.');
    next.entries.push(entry);
  }
  return next;
}
