import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Session } from '@supabase/supabase-js';
import { FinanceState, emptyState, hydrateState } from '../domain/model';
import { Operation, applyOperation } from '../domain/operations';
import { supabase } from '../lib/supabase';
import { loadRemote, saveRemote } from '../lib/repository';
const DEMO_KEY = 'gestao.demo.v1';
const prefsKey = (userId: string) => `gestao.prefs.v1.${userId}`;
async function readPrefs(userId: string) {
  try {
    const raw = await AsyncStorage.getItem(prefsKey(userId));
    const data = raw ? JSON.parse(raw) : {};
    return { budgets: Array.isArray(data.budgets) ? data.budgets : [], categoryMemory: Array.isArray(data.categoryMemory) ? data.categoryMemory : [] };
  } catch { return { budgets: [], categoryMemory: [] }; }
}
async function writePrefs(userId: string, state: FinanceState) {
  await AsyncStorage.setItem(prefsKey(userId), JSON.stringify({ budgets: state.budgets ?? [], categoryMemory: state.categoryMemory ?? [] }));
}
type Context = { state: FinanceState; mode: 'welcome' | 'demo' | 'remote'; loading: boolean; busy: boolean; error: string; session: Session | null; startDemo: () => Promise<void>; leave: () => Promise<void>; refresh: () => Promise<void>; mutate: (action: Operation['action'], records: Operation['records'], operationId?: string) => Promise<void> };
const FinanceContext = createContext<Context | null>(null);
export const newId = () => Crypto.randomUUID();
export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FinanceState>(emptyState), [mode, setMode] = useState<Context['mode']>('welcome');
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const lock = useRef(false), generation = useRef(0);
  async function refresh() {
    const current = generation.current;
    setLoading(true); setError('');
    try {
      const remote = hydrateState(await loadRemote());
      const prefs = session?.user.id ? await readPrefs(session.user.id) : { budgets: [], categoryMemory: [] };
      if (generation.current === current) setState({ ...remote, ...prefs });
    }
    catch (e) { if (generation.current === current) setError((e as Error).message); }
    finally { if (generation.current === current) setLoading(false); }
  }
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let mounted = true;
    const update = (next: Session | null) => {
      if (!mounted) return;
      generation.current++; setState(emptyState()); setSession(next); setMode(next ? 'remote' : 'welcome'); setLoading(false); setError('');
    };
    supabase.auth.getSession().then(({ data, error }) => { if (error) setError('Não foi possível recuperar a sessão.'); update(data.session); });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      // Editing presentation metadata must not clear an already loaded ledger.
      if (event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') setSession(next);
      else update(next);
    });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => { if (mode === 'remote' && session) void refresh(); }, [mode, session?.user.id]);
  async function startDemo() {
    setLoading(true); setError('');
    try { const raw = await AsyncStorage.getItem(DEMO_KEY); setState(hydrateState(raw ? JSON.parse(raw) : undefined)); generation.current++; setMode('demo'); }
    catch { setError('Não foi possível abrir o teste local.'); }
    finally { setLoading(false); }
  }
  async function leave() {
    if (lock.current) throw new Error('Aguarde a operação atual.');
    if (mode === 'remote') { const { error } = await supabase!.auth.signOut(); if (error) throw new Error('Não foi possível sair. Tente novamente.'); }
    generation.current++; setState(emptyState()); setSession(null); setMode('welcome'); setError('');
  }
  async function mutate(action: Operation['action'], records: Operation['records'], operationId = newId()) {
    if (lock.current) throw new Error('Aguarde a operação atual.');
    if (mode === 'welcome' || (mode === 'remote' && (loading || error))) throw new Error('Carregue os dados antes de salvar.');
    lock.current = true; setBusy(true);
    const current = generation.current;
    try {
      const operation = { id: operationId, action, records }, next = applyOperation(state, operation);
      if (mode === 'demo') await AsyncStorage.setItem(DEMO_KEY, JSON.stringify(next));
      let saved = next;
      if (mode === 'remote') {
        try {
          if (operation.action === 'budget') {
            if (!session?.user.id) throw new Error('Entre na conta para salvar o limite.');
            await writePrefs(session.user.id, next);
          } else {
            await saveRemote(operation);
            saved = { ...hydrateState(await loadRemote()), budgets: next.budgets ?? [], categoryMemory: next.categoryMemory ?? [] };
            if (session?.user.id) await writePrefs(session.user.id, saved);
          }
        }
        catch (e) { if (current === generation.current && operation.action !== 'budget') setError('Não foi possível confirmar a operação online. Atualize os dados na aba Contas antes de continuar.'); throw e; }
      }
      if (current === generation.current) setState(saved);
    } finally { lock.current = false; setBusy(false); }
  }
  return <FinanceContext.Provider value={{ state, mode, loading, busy, error, session, startDemo, leave, refresh, mutate }}>{children}</FinanceContext.Provider>;
}
export function useFinance() { const value = useContext(FinanceContext); if (!value) throw new Error('FinanceProvider ausente'); return value; }
