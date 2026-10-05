export type Account = { id: string; name: string; bank: string; openingBalance: number };
export type Card = { id: string; name: string; closingDay: number; dueDay: number; limit: number };
export type EntryKind = 'income' | 'expense' | 'transfer' | 'card_purchase' | 'card_payment';
export type Entry = {
  id: string; kind: EntryKind; accountId?: string; destinationId?: string; cardId?: string;
  amount: number; date: string; description: string; category: string;
  method: 'pix' | 'debit' | 'cash' | 'credit'; installments?: number; statementMonth?: string;
  source?: string; sourceKey?: string;
};
export type Budget = { category: string; limit: number };
export type CategoryRule = { key: string; category: string };
export type FinanceState = { accounts: Account[]; cards: Card[]; entries: Entry[]; budgets?: Budget[]; categoryMemory?: CategoryRule[] };
export function hydrateState(raw: unknown): FinanceState {
  const data = raw && typeof raw === 'object' ? raw as Partial<FinanceState> : {};
  return {
    accounts: Array.isArray(data.accounts) ? data.accounts : [],
    cards: Array.isArray(data.cards) ? data.cards : [],
    entries: Array.isArray(data.entries) ? data.entries : [],
    budgets: Array.isArray(data.budgets) ? data.budgets : [],
    categoryMemory: Array.isArray(data.categoryMemory) ? data.categoryMemory : [],
  };
}
export const emptyState = (): FinanceState => hydrateState(undefined);
export const categories = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Lazer', 'Compras', 'Salário', 'Outros'];
export const banks = ['Banco do Brasil', 'Mercado Pago', 'PicPay', 'Inter', 'Outro'];
