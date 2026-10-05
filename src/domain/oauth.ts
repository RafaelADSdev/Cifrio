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
