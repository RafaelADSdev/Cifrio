import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import { FinanceProvider, useFinance } from '../src/state/FinanceProvider';

const api = vi.hoisted(() => ({ getSession: vi.fn(), onAuthStateChange: vi.fn(), unsubscribe: vi.fn(), loadRemote: vi.fn(), saveRemote: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ supabase: { auth: { getSession: api.getSession, onAuthStateChange: api.onAuthStateChange } } }));
vi.mock('../src/lib/repository', () => ({ loadRemote: api.loadRemote, saveRemote: api.saveRemote }));
vi.mock('@react-native-async-storage/async-storage', () => ({ default: { getItem: vi.fn().mockResolvedValue(null), setItem: vi.fn() } }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'operation' }));

function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const session = (id = 'owner'): Session => ({ user: { id }, access_token: 'fixture', refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600 } as Session);
const ledger = (name = 'Conta restaurada') => ({ accounts: [{ id: 'account', name, bank: 'Banco', openingBalance: 100000 }], entries: [], cards: [], appliedOperations: [] });
let startup: ReturnType<typeof deferred<{ data: { session: Session | null }; error: Error | null }>>;
let emit: (event: string, next: Session | null) => void;
let current: ReturnType<typeof useFinance>;
let renderer: ReactTestRenderer | undefined;
function Probe() { current = useFinance(); return null; }
async function mount() { await act(async () => { renderer = create(React.createElement(FinanceProvider, null, React.createElement(Probe))); }); }
async function restore(next = session()) { await act(async () => { startup.resolve({ data: { session: next }, error: null }); }); }
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.resetAllMocks(); startup = deferred();
  api.getSession.mockReturnValue(startup.promise);
  api.onAuthStateChange.mockImplementation(callback => { emit = callback; return { data: { subscription: { unsubscribe: api.unsubscribe } } }; });
  api.loadRemote.mockResolvedValue(ledger());
});
afterEach(async () => { await act(async () => { renderer?.unmount(); renderer = undefined; }); });

it('restaura o saldo quando INITIAL_SESSION chega durante o carregamento iniciado por getSession', async () => {
  const pending = deferred<ReturnType<typeof ledger>>(); api.loadRemote.mockReturnValue(pending.promise);
  await mount(); await restore(); expect(current.loading).toBe(true);
  await act(async () => { emit('INITIAL_SESSION', session()); });
  await act(async () => { pending.resolve(ledger()); });
  expect(current.state.accounts).toEqual(ledger().accounts);
  expect(current.loading).toBe(false); expect(api.loadRemote).toHaveBeenCalledTimes(1);
});
it('um snapshot atrasado da abertura não sobrescreve uma sessão mais recente', async () => {
  await mount(); await act(async () => { emit('INITIAL_SESSION', session()); });
  await act(async () => { startup.resolve({ data: { session: null }, error: null }); });
  expect(current.mode).toBe('remote'); expect(current.session?.user.id).toBe('owner');
  expect(current.state.accounts).toEqual(ledger().accounts);
});
it('avisos repetidos de login, renovação e perfil preservam o extrato já carregado', async () => {
  await mount(); await restore();
  for (const event of ['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED']) {
    await act(async () => { emit(event, session()); });
    expect(current.state.accounts).toEqual(ledger().accounts);
    expect(current.loading).toBe(false);
  }
  expect(api.loadRemote).toHaveBeenCalledTimes(1);
});
it('renovação de token na abertura também restaura a conta', async () => {
  await mount(); await act(async () => { emit('TOKEN_REFRESHED', session()); });
  await restore(); expect(current.mode).toBe('remote'); expect(current.state.accounts).toEqual(ledger().accounts);
});
it('trocar de usuário descarta a resposta pendente da conta anterior', async () => {
  const old = deferred<ReturnType<typeof ledger>>(), next = deferred<ReturnType<typeof ledger>>();
  api.loadRemote.mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise);
  await mount(); await restore();
  await act(async () => { emit('SIGNED_IN', session('other-owner')); });
  expect(current.loading).toBe(true); expect(current.state.accounts).toEqual([]);
  await act(async () => { next.resolve(ledger('Outra conta')); });
  await act(async () => { old.resolve(ledger()); });
  expect(current.state.accounts[0].name).toBe('Outra conta'); expect(current.session?.user.id).toBe('other-owner');
});
it('sair durante a leitura impede que dados antigos reapareçam', async () => {
  const pending = deferred<ReturnType<typeof ledger>>(); api.loadRemote.mockReturnValue(pending.promise);
  await mount(); await restore(); await act(async () => { emit('SIGNED_OUT', null); });
  await act(async () => { pending.resolve(ledger()); });
  expect(current.mode).toBe('welcome'); expect(current.state.accounts).toEqual([]); expect(current.loading).toBe(false);
});
it('falha na recuperação da sessão fica visível e encerra o carregamento', async () => {
  await mount(); await act(async () => { startup.reject(new Error('offline')); });
  expect(current.error).toContain('recuperar a sessão'); expect(current.loading).toBe(false);
});