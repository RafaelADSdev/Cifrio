export type Account = { id: string; name: string; bank: string; openingBalance: number };
export type Card = { id: string; name: string; closingDay: number; dueDay: number; limit: number };
export type EntryKind = 'income' | 'expense' | 'transfer' | 'card_purchase' | 'card_payment';
export type Entry = {
  id: string; kind: EntryKind; accountId?: string; destinationId?: string; cardId?: string;
  amount: number; date: string; description: string; category: string;
  method: 'pix' | 'debit' | 'cash' | 'credit'; installments?: number; statementMonth?: string;
  source?: string; sourceKey?: string;
};
export type FinanceState = { accounts: Account[]; cards: Card[]; entries: Entry[] };
export const emptyState = (): FinanceState => ({ accounts: [], cards: [], entries: [] });
export const categories = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Lazer', 'Compras', 'Salário', 'Outros'];
export const banks = ['Banco do Brasil', 'Mercado Pago', 'PicPay', 'Inter', 'Outro'];
