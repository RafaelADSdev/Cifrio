const PREVIEW_ORIGIN = 'http://localhost:8081';
const lanHost = (host: string) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) && host !== '127.0.0.1';
export function googleWebStartError(origin: string): string | null {
  if (origin === PREVIEW_ORIGIN) return null;
  let host = '';
  try { host = new URL(origin).hostname; } catch { return 'Abra o Cifrio em http://localhost:8081 para entrar com Google.'; }
  if (lanHost(host)) return 'O Google não volta para o IP da rede e abre o outro projeto. Abra http://localhost:8081 neste computador.';
  return 'O retorno do Google do Cifrio só está liberado em http://localhost:8081. Abra o aplicativo nesse endereço.';
}
export function callbackCode(actual: string, expected: string): string {
  let url: URL, target: URL;
  try { url = new URL(actual); target = new URL(expected); } catch { throw new Error('Retorno de login inválido.'); }
  if (url.protocol !== target.protocol || url.host !== target.host || url.pathname !== target.pathname || url.username || url.password) throw new Error('Retorno de login não autorizado.');
  if (url.searchParams.has('error') || url.hash.includes('error=')) throw new Error('Não foi possível concluir o acesso Google. Tente novamente.');
  const code = url.searchParams.get('code');
  if (!code || code.length > 2048 || url.searchParams.getAll('code').length !== 1) throw new Error('O retorno não contém um código de acesso válido.');
  return code;
}
type BrowserStorage = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };
// Only the PKCE verifier survives a redirect. Access/refresh tokens never enter browser storage.
export function previewAuthStorage(verifiers: () => BrowserStorage) {
  const memory = new Map<string, string>();
  return {
    getItem(key: string) { return key.endsWith('-code-verifier') ? verifiers().getItem(key) : memory.get(key) ?? null; },
    setItem(key: string, value: string) { if (key.endsWith('-code-verifier')) verifiers().setItem(key, value); else memory.set(key, value); },
    removeItem(key: string) { if (key.endsWith('-code-verifier')) verifiers().removeItem(key); else memory.delete(key); },
  };
}
