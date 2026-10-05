import { Account, Card, Entry, FinanceState } from './model';
import { insertEntries, installmentsFor, statement, validateAccount, validateCard, validateEntry } from './finance';
export type Operation = { id: string; action: 'account' | 'card' | 'entries' | 'edit' | 'delete'; records: (Account | Card | Entry | { id: string })[] };
export function applyOperation(state: FinanceState, operation: Operation): FinanceState {
  let next = state;
  if (operation.action === 'account') {
    const account = operation.records[0] as Account; validateAccount(account);
    next = { ...state, accounts: [...state.accounts.filter(a => a.id !== account.id), account] };
  } else if (operation.action === 'card') {
    const card = operation.records[0] as Card; validateCard(card);
    next = { ...state, cards: [...state.cards.filter(c => c.id !== card.id), card] };
  } else if (operation.action === 'entries') next = insertEntries(state, operation.records as Entry[]);
  else if (operation.action === 'edit') {
    const entry = operation.records[0] as Entry;
    if (!state.entries.some(e => e.id === entry.id)) throw new Error('Movimentação não encontrada.');
    validateEntry(state, entry);
    next = { ...state, entries: state.entries.map(e => e.id === entry.id ? entry : e) };
  } else if (operation.action === 'delete') next = { ...state, entries: state.entries.filter(e => e.id !== operation.records[0].id) };
  for (const card of next.cards) {
    const months = new Set(next.entries.filter(e => e.cardId === card.id).flatMap(e => e.kind === 'card_purchase' ? installmentsFor(e, card).map(p => p.month) : [e.statementMonth!]));
    for (const month of months) if (statement(next, card.id, month).remaining < 0) throw new Error('Esse ajuste deixaria uma fatura paga acima do total. Ajuste o pagamento primeiro.');
  }
  return next;
}
