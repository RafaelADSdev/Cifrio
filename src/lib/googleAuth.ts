import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { callbackCode } from '../domain/oauth';
import { supabase } from './supabase';
const lanAddress = (host: string) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) && host !== '127.0.0.1';
export const authRedirect = () => Platform.OS === 'web' ? `${window.location.origin}/auth/callback` : makeRedirectUri({ scheme: 'gestao', path: 'auth/callback', native: 'gestao://auth/callback', preferLocalhost: true });
let exchange: { code: string; result: Promise<void> } | null = null;
export async function completeGoogleSignIn(url: string): Promise<void> {
  const code = callbackCode(url, authRedirect());
  if (exchange?.code === code) return exchange.result;
  const result = (async () => {
    if (!supabase) throw new Error('Configure o Supabase para entrar com Google.');
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error('Não foi possível concluir o acesso. Inicie o login novamente.');
  })();
  exchange = { code, result }; return result;
}
export async function signInGoogle(): Promise<'redirect' | 'success' | 'cancelled'> {
  if (!supabase) throw new Error('Configure o Supabase para entrar com Google.');
  if (Platform.OS === 'web' && lanAddress(window.location.hostname)) throw new Error('O Google não volta para o IP da rede e abre o outro projeto. Use o Expo Go ou abra por localhost neste computador.');
  const redirectTo = authRedirect();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } } });
  if (error || !data.url) throw new Error('Não foi possível iniciar o Google. Verifique a configuração do provedor.');
  if (Platform.OS === 'web') { window.location.assign(data.url); return 'redirect'; }
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return 'cancelled';
  await completeGoogleSignIn(result.url); return 'success';
}
