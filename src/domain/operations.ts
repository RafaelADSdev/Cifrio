import { Account, Budget, Card, Entry, FinanceState } from './model';
import { insertEntries, installmentsFor, statement, validateAccount, validateCard, validateEntry } from './finance';
import { rememberFromEntry, upsertBudget } from './planning';
export type Operation = { id: string; action: 'account' | 'card' | 'entries' | 'edit' | 'delete' | 'budget'; records: (Account | Card | Entry | Budget | { id: string })[] };
export function applyOperation(state: FinanceState, operation: Operation): FinanceState {
  let next = state;
  if (operation.action === 'account') {
    const account = operation.records[0] as Account; validateAccount(account);
    next = { ...state, accounts: [...state.accounts.filter(a => a.id !== account.id), account] };
  } else if (operation.action === 'card') {
    const card = operation.records[0] as Card; validateCard(card);
    next = { ...state, cards: [...state.cards.filter(c => c.id !== card.id), card] };
  } else if (operation.action === 'entries') {
    const entries = operation.records as Entry[];
    next = insertEntries(state, entries);
    next = { ...next, categoryMemory: entries.reduce((rules, entry) => rememberFromEntry(rules, entry), next.categoryMemory ?? []) };
  } else if (operation.action === 'edit') {
    const entry = operation.records[0] as Entry;
    if (!state.entries.some(e => e.id === entry.id)) throw new Error('Movimentação não encontrada.');
    validateEntry(state, entry);
    next = { ...state, entries: state.entries.map(e => e.id === entry.id ? entry : e), categoryMemory: rememberFromEntry(state.categoryMemory, entry, true) };
  } else if (operation.action === 'delete') next = { ...state, entries: state.entries.filter(e => e.id !== (operation.records[0] as { id: string }).id) };
  else if (operation.action === 'budget') next = { ...state, budgets: upsertBudget(state.budgets, operation.records[0] as Budget) };
  for (const card of next.cards) {
    const months = new Set(next.entries.filter(e => e.cardId === card.id).flatMap(e => e.kind === 'card_purchase' ? installmentsFor(e, card).map(p => p.month) : [e.statementMonth!]));
    for (const month of months) if (statement(next, card.id, month).remaining < 0) throw new Error('Esse ajuste deixaria uma fatura paga acima do total. Ajuste o pagamento primeiro.');
  }
  return next;
}
