import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { blankProfile, localProfile, metadataProfile, Profile, profileName } from '../domain/profile';
import { ProfilePhoto, readProfile, writeProfile } from '../lib/profileRepository';
import { useFinance } from './FinanceProvider';
const KEY = 'cifrio.profile.demo.v1';
type ProfileContextValue = { profile: Profile; loading: boolean; saving: boolean; error: string; refresh: () => Promise<void>; save: (name: string, photo?: ProfilePhoto | null) => Promise<string> };
const ProfileContext = createContext<ProfileContextValue | null>(null);
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { mode, session } = useFinance();
  const [profile, setProfile] = useState<Profile>(blankProfile), [loading, setLoading] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState('');
  const generation = useRef(0), lock = useRef(false), current = useRef({ mode, session });
  current.current = { mode, session };
  async function refresh() {
    const version = ++generation.current, context = current.current;
    setLoading(true); setError('');
    try {
      const next = context.mode === 'remote' && context.session ? await readProfile(context.session.user) : context.mode === 'demo' ? localProfile(await AsyncStorage.getItem(KEY) ?? '{"displayName":""}') : blankProfile();
      if (version === generation.current) setProfile(next);
    } catch (e) { if (version === generation.current) setError((e as Error).message); }
    finally { if (version === generation.current) setLoading(false); }
  }
  useEffect(() => {
    setProfile(mode === 'remote' && session ? metadataProfile(session.user.user_metadata, session.user.id) : blankProfile());
    void refresh();
    const timer = mode === 'remote' ? setInterval(() => void refresh(), 45 * 60 * 1000) : null;
    return () => { generation.current++; if (timer) clearInterval(timer); };
  }, [mode, session?.user.id]);
  async function save(name: string, photo?: ProfilePhoto | null): Promise<string> {
    if (lock.current || loading) throw new Error('Aguarde o perfil carregar ou terminar de salvar.');
    const displayName = profileName(name), version = generation.current, context = current.current;
    if (context.mode === 'welcome') throw new Error('Abra uma sessão antes de editar o perfil.');
    lock.current = true; setSaving(true); setError('');
    try {
      let next: Profile, warning = '';
      if (context.mode === 'demo') {
        next = { displayName, avatarPath: null, avatarUrl: photo === undefined ? profile.avatarUrl : photo?.dataUrl ?? null };
        await AsyncStorage.setItem(KEY, JSON.stringify(next));
      } else {
        const result = await writeProfile(context.session!.user.id, displayName, photo); next = result.profile; warning = result.warning;
      }
      if (version === generation.current) setProfile(next);
      return warning;
    } finally { lock.current = false; setSaving(false); }
  }
  return <ProfileContext.Provider value={{ profile, loading, saving, error, refresh, save }}>{children}</ProfileContext.Provider>;
}
export function useProfile() { const context = useContext(ProfileContext); if (!context) throw new Error('ProfileProvider ausente.'); return context; }
