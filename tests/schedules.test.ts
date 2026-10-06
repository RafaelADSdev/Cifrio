import { expect, it } from 'vitest';
import { emptyState, Recurring } from '../src/domain/model';
import { applyOperation } from '../src/domain/operations';
import { recurringEntry, recurringDate, recurringPlan } from '../src/domain/recurring';
import { balance } from '../src/domain/finance';
const base = () => ({ ...emptyState(), accounts: [{ id: 'a', name: 'Conta', bank: 'BB', openingBalance: 10000 }] });
const salary: Recurring = { id: 's', accountId: 'a', description: 'Salário', kind: 'income', category: 'Salário', amount: 200000, day: 31, startMonth: '2026-01', active: true };
it('cadastro recorrente não altera saldo; confirmação mensal não duplica', () => {
  const state = applyOperation(base(), { id: 'op', action: 'recurring', records: [salary] });
  expect(balance(state, 'a')).toBe(10000);
  const entry = recurringEntry(state, salary, '2026-02', 'e');
  const next = applyOperation(state, { id: 'op2', action: 'entries', records: [entry] });
  expect(balance(next, 'a')).toBe(210000);
  expect(() => recurringEntry(next, salary, '2026-02', 'e2')).toThrow(/já registrado/);
  expect(applyOperation(next, { id: 'retry', action: 'entries', records: [{ ...entry, id: 'retry' }] }).entries).toHaveLength(1);
});
it('ajusta o dia ao fim do mês e mantém despesas positivas no modelo', () => {
  expect(recurringDate(salary, '2026-02')).toBe('2026-02-28');
  expect(recurringDate(salary, '2028-02')).toBe('2028-02-29');
  const rent = { ...salary, kind: 'expense' as const, category: 'Moradia' };
  expect(recurringEntry(base(), rent, '2026-01', 'e')).toMatchObject({ kind: 'expense', amount: 200000, method: 'pix' });
});
it('recusa data anterior ao início, pausa, conta inexistente e valor inválido', () => {
  expect(() => recurringEntry(base(), salary, '2025-12', 'e')).toThrow(/início/);
  expect(() => recurringEntry(base(), { ...salary, active: false }, '2026-02', 'e')).toThrow(/pausada/);
  for (const bad of [{ ...salary, amount: -10 }, { ...salary, day: 0 }, { ...salary, startMonth: '2026-13' }, { ...salary, accountId: 'missing' }]) {
    expect(() => applyOperation(base(), { id: 'op', action: 'recurring', records: [bad] })).toThrow();
  }
});
it('separa assinaturas de contas fixas no plano da recorrência', () => {
  const sub = { ...salary, id: 'sub', kind: 'expense' as const, category: 'Lazer', description: 'Streaming', plan: 'subscription' as const };
  const withSub = applyOperation(base(), { id: 'op', action: 'recurring', records: [sub] });
  expect(recurringPlan(withSub.recurring![0])).toBe('subscription');
  expect(recurringPlan(salary)).toBe('fixed');
});

it('exclui somente contas sem histórico e sem recorrências vinculadas', () => {
  expect(applyOperation(base(), { id: 'op', action: 'account_delete', records: [{ id: 'a' }] }).accounts).toHaveLength(0);
  const withSchedule = applyOperation(base(), { id: 'op', action: 'recurring', records: [salary] });
  expect(() => applyOperation(withSchedule, { id: 'op', action: 'account_delete', records: [{ id: 'a' }] })).toThrow(/recorr/);
  const entry = recurringEntry(withSchedule, salary, '2026-02', 'e');
  const recorded = applyOperation(withSchedule, { id: 'op', action: 'entries', records: [entry] });
  const removed = applyOperation(recorded, { id: 'op', action: 'recurring_delete', records: [{ id: 's' }] });
  expect(removed.entries).toHaveLength(1);
  expect(() => applyOperation(removed, { id: 'op', action: 'account_delete', records: [{ id: 'a' }] })).toThrow(/movimenta/);
  expect(() => applyOperation({ ...base(), entries: [{ ...entry, accountId: 'other', destinationId: 'a', kind: 'transfer' }] }, { id: 'op', action: 'account_delete', records: [{ id: 'a' }] })).toThrow(/movimenta/);
});
