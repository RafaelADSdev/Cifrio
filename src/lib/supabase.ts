import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (key && !key.startsWith('sb_publishable_')) throw new Error('Use apenas a chave publicável do Supabase no aplicativo.');
if (url && !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) throw new Error('Configure a URL HTTPS do projeto Supabase.');
const secureStorage = { getItem: SecureStore.getItemAsync, setItem: SecureStore.setItemAsync, removeItem: SecureStore.deleteItemAsync };
// Web preview sessions remain in memory. Mobile sessions use platform secure storage.
export const supabase = url && key ? createClient(url, key, { auth: { ...(Platform.OS !== 'web' ? { storage: secureStorage } : {}), persistSession: Platform.OS !== 'web', autoRefreshToken: true, detectSessionInUrl: false } }) : null;
if (Platform.OS !== 'web' && supabase) AppState.addEventListener('change', state => {
  if (state === 'active') supabase!.auth.startAutoRefresh(); else supabase!.auth.stopAutoRefresh();
});
