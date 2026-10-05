import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import * as ExpoCrypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { previewAuthStorage } from '../domain/oauth';
if (!globalThis.crypto?.subtle?.digest) {
  const subtle = { digest: (_algorithm: AlgorithmIdentifier, data: BufferSource) => ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256, data) };
  if (globalThis.crypto) Object.defineProperty(globalThis.crypto, 'subtle', { value: subtle, configurable: true });
  else Object.defineProperty(globalThis, 'crypto', { value: { subtle, getRandomValues: ExpoCrypto.getRandomValues, randomUUID: ExpoCrypto.randomUUID }, configurable: true });
}
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (key && !key.startsWith('sb_publishable_')) throw new Error('Use apenas a chave publicável do Supabase no aplicativo.');
if (url && !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) throw new Error('Configure a URL HTTPS do projeto Supabase.');
const secureStorage = { getItem: SecureStore.getItemAsync, setItem: SecureStore.setItemAsync, removeItem: SecureStore.deleteItemAsync };
// Web preview sessions remain in memory. Mobile sessions use platform secure storage.
export const supabase = url && key ? createClient(url, key, { auth: { storage: Platform.OS === 'web' ? previewAuthStorage(() => window.sessionStorage) : secureStorage, persistSession: true, flowType: 'pkce', autoRefreshToken: true, detectSessionInUrl: false } }) : null;
if (Platform.OS !== 'web' && supabase) AppState.addEventListener('change', state => {
  if (state === 'active') supabase!.auth.startAutoRefresh(); else supabase!.auth.stopAutoRefresh();
});
