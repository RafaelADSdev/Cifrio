import { expect, it } from 'vitest';
import { emptyState } from '../src/domain/model';
import { applyOperation } from '../src/domain/operations';
import { validateCard } from '../src/domain/finance';

const base = () => ({
  ...emptyState(),
  cards: [{ id: 'c', name: 'Cartão', closingDay: 10, dueDay: 17, limit: 500000 }],
});

it('preserva a aparência do cartão no registro e aceita cadastros antigos', () => {
  const card = { ...base().cards[0], network: 'mastercard' as const, theme: 'plum' as const, lastFour: '1234' };
  const state = applyOperation(base(), { id: 'appearance', action: 'card', records: [card] });
  expect(JSON.parse(JSON.stringify(state)).cards[0]).toMatchObject({ network: 'mastercard', theme: 'plum', lastFour: '1234' });
  expect(() => validateCard(base().cards[0])).not.toThrow();
  for (const lastFour of ['123', '12345', 'abcd', '1234 5678 9012 3456']) expect(() => validateCard({ ...card, lastFour })).toThrow(/quatro/);
});

it('atualiza cartão existente e exclui só sem movimentações', () => {
  const updated = applyOperation(base(), { id: 'op', action: 'card', records: [{ id: 'c', name: 'Visa', closingDay: 5, dueDay: 12, limit: 300000 }] });
  expect(updated.cards[0]).toMatchObject({ name: 'Visa', closingDay: 5, dueDay: 12, limit: 300000 });
  expect(applyOperation(base(), { id: 'op2', action: 'card_delete', records: [{ id: 'c' }] }).cards).toHaveLength(0);
  const withPurchase = {
    ...base(),
    entries: [{ id: 'e', kind: 'card_purchase' as const, cardId: 'c', amount: 1000, installments: 1, description: 'Loja', category: 'Outros', date: '2026-10-01', method: 'credit' as const }],
  };
  expect(() => applyOperation(withPurchase, { id: 'op3', action: 'card_delete', records: [{ id: 'c' }] })).toThrow(/movimenta/);
});
