import { beforeEach, expect, it, vi } from 'vitest';
const api = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn(), delete: vi.fn(), eq: vi.fn(), select: vi.fn(), upsert: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ supabase: { from: api.from, rpc: api.rpc } }));
import { loadRemote, saveRemote } from '../src/lib/repository';
beforeEach(() => {
  vi.resetAllMocks();
  api.from.mockReturnValue(api); api.delete.mockReturnValue(api); api.eq.mockReturnValue(api); api.upsert.mockReturnValue(api);
  api.select.mockResolvedValue({ data: [{ id: 'a' }], error: null }); api.rpc.mockResolvedValue({ data: {}, error: null });
});
it('exclusões são filtradas pelo id e exigem confirmação do servidor', async () => {
  await saveRemote({ id: 'op', action: 'account_delete', records: [{ id: 'a' }] });
  expect(api.from).toHaveBeenCalledWith('finance_accounts'); expect(api.eq).toHaveBeenCalledWith('id', 'a'); expect(api.select).toHaveBeenCalledWith('id');
  await saveRemote({ id: 'op2', action: 'recurring_delete', records: [{ id: 's' }] });
  expect(api.from).toHaveBeenLastCalledWith('finance_schedules');
  await saveRemote({ id: 'op4', action: 'card_delete', records: [{ id: 'c' }] });
  expect(api.from).toHaveBeenLastCalledWith('finance_cards');
  api.select.mockResolvedValue({ data: [], error: null });
  await expect(saveRemote({ id: 'op3', action: 'account_delete', records: [{ id: 'a' }] })).rejects.toThrow(/excluir/);
});
it('salva o template pela chave de proprietário e não mascara falhas de migração', async () => {
  const item = { id: 's', accountId: 'a', description: 'Salário', kind: 'income' as const, category: 'Salário', amount: 10000, day: 1, startMonth: '2026-10', active: true };
  await saveRemote({ id: 'op', action: 'recurring', records: [item] });
  expect(api.upsert).toHaveBeenCalledWith({ id: item.id, data: item }, { onConflict: 'user_id,id' });
  api.select.mockResolvedValue({ data: null, error: { message: 'missing relation' } });
  await expect(saveRemote({ id: 'op2', action: 'recurring', records: [item] })).rejects.toThrow(/migração/);
});
it('preserva o caminho RPC dos lançamentos e da leitura, incluindo snapshots anteriores', async () => {
  await saveRemote({ id: 'op', action: 'entries', records: [] });
  expect(api.rpc).toHaveBeenCalledWith('mutate_finance', { p_action: 'entries', p_records: [], p_operation_id: 'op' });
  const snapshot = { accounts: [], cards: [], entries: [] }; api.rpc.mockResolvedValue({ data: snapshot, error: null });
  expect(await loadRemote()).toEqual(snapshot); expect(api.from).not.toHaveBeenCalled();
});
