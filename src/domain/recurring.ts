import { categories, Entry, FinanceState, Recurring } from './model';
export function validateRecurring(state: FinanceState, item: Recurring) {
  if (!item.id || !state.accounts.some(account => account.id === item.accountId)) throw new Error('Selecione uma conta válida.');
  if (!item.description?.trim() || item.description.length > 120 || !['income', 'expense'].includes(item.kind) || !categories.includes(item.category)) throw new Error('Revise a descrição, tipo e categoria.');
  if (!Number.isSafeInteger(item.amount) || item.amount <= 0 || item.amount > 100_000_000_000) throw new Error('Informe um valor maior que zero.');
  if (!Number.isInteger(item.day) || item.day < 1 || item.day > 31 || !/^20\d{2}-(0[1-9]|1[0-2])$/.test(item.startMonth) || typeof item.active !== 'boolean') throw new Error('Use dia de 1 a 31 e início no formato AAAA-MM.');
}
export function recurringDate(item: Recurring, month: string) {
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Escolha um mês válido.');
  const [year, number] = month.split('-').map(Number);
  const last = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return `${month}-${String(Math.min(item.day, last)).padStart(2, '0')}`;
}
export const recurringKey = (id: string, month: string) => `recurring:${id}:${month}`;
export function recurringEntry(state: FinanceState, item: Recurring, month: string, id: string): Entry {
  validateRecurring(state, item);
  if (!item.active) throw new Error('Esta recorrência está pausada.');
  if (month < item.startMonth) throw new Error('Esse mês é anterior ao início da recorrência.');
  const date = recurringDate(item, month), sourceKey = recurringKey(item.id, month);
  if (state.entries.some(entry => entry.accountId === item.accountId && entry.sourceKey === sourceKey)) throw new Error('Esse mês já registrado. Confira o extrato.');
  return { id, kind: item.kind, accountId: item.accountId, amount: item.amount, date, description: item.description, category: item.category, method: 'pix', source: 'recurring', sourceKey };
}
export function accountDeleteReason(state: FinanceState, id: string) {
  if (state.entries.some(entry => entry.accountId === id || entry.destinationId === id)) return 'Esta conta tem movimentações. Preserve o histórico; não é possível excluí-la.';
  if ((state.recurring ?? []).some(item => item.accountId === id)) return 'Remova as recorrências vinculadas antes de excluir esta conta.';
  return '';
}
