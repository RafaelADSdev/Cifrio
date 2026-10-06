export type Account = { id: string; name: string; bank: string; openingBalance: number };
export const cardNetworks = ['none', 'visa', 'mastercard', 'elo', 'amex', 'other'] as const;
export const cardThemes = ['forest', 'carbon', 'ocean', 'plum'] as const;
export type CardNetwork = typeof cardNetworks[number];
export type CardTheme = typeof cardThemes[number];
export type Card = { id: string; name: string; closingDay: number; dueDay: number; limit: number; network?: CardNetwork; theme?: CardTheme; lastFour?: string };
export type EntryKind = 'income' | 'expense' | 'transfer' | 'card_purchase' | 'card_payment';
export type Entry = {
  id: string; kind: EntryKind; accountId?: string; destinationId?: string; cardId?: string;
  amount: number; date: string; description: string; category: string;
  method: 'pix' | 'debit' | 'cash' | 'credit'; installments?: number; statementMonth?: string;
  source?: string; sourceKey?: string;
};
export type Budget = { category: string; limit: number };
export type RecurringPlan = 'fixed' | 'subscription';
export type Recurring = { id: string; accountId: string; description: string; kind: 'income' | 'expense'; category: string; amount: number; day: number; startMonth: string; active: boolean; plan?: RecurringPlan };
export type CategoryRule = { key: string; category: string };
export type FinanceState = { accounts: Account[]; cards: Card[]; entries: Entry[]; budgets?: Budget[]; categoryMemory?: CategoryRule[]; recurring?: Recurring[] };
export function hydrateState(raw: unknown): FinanceState {
  const data = raw && typeof raw === 'object' ? raw as Partial<FinanceState> : {};
  return {
    accounts: Array.isArray(data.accounts) ? data.accounts : [],
    cards: Array.isArray(data.cards) ? data.cards : [],
    entries: Array.isArray(data.entries) ? data.entries : [],
    budgets: Array.isArray(data.budgets) ? data.budgets : [],
    categoryMemory: Array.isArray(data.categoryMemory) ? data.categoryMemory : [],
    recurring: Array.isArray(data.recurring) ? data.recurring : [],
  };
}
export const emptyState = (): FinanceState => hydrateState(undefined);
export const categories = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Lazer', 'Compras', 'Salário', 'Outros'];
export const banks = ['Banco do Brasil', 'Mercado Pago', 'PicPay', 'Inter', 'Outro'];
