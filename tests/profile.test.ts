import { expect, it } from 'vitest';
import { avatarType, googleAvatar, localProfile, MAX_AVATAR_BYTES, metadataProfile, ownAvatarPath, profileName } from '../src/domain/profile';
import { callbackCode, googleWebStartError, previewAuthStorage } from '../src/domain/oauth';
const userId = '00000000-0000-4000-8000-000000000001';
it('validates names and ignores malformed presentation metadata', () => {
  expect(profileName('  Ana Silva  ')).toBe('Ana Silva');
  for (const name of ['', 'a'.repeat(81), 'Ana\nSilva']) expect(() => profileName(name)).toThrow();
  expect(metadataProfile({ display_name: 123, avatar_url: 'javascript:alert(1)' }, userId)).toEqual({ displayName: '', avatarPath: null, avatarUrl: null });
});
it('restricts avatar references to the authenticated user and trusted Google hosts', () => {
  const path = `${userId}/10000000-0000-4000-8000-000000000001.png`;
  expect(ownAvatarPath(path, userId)).toBe(path);
  expect(ownAvatarPath(path, '00000000-0000-4000-8000-000000000002')).toBeNull();
  expect(ownAvatarPath(`${userId}/../other.png`, userId)).toBeNull();
  expect(ownAvatarPath('attacker/10000000-0000-4000-8000-000000000001.png', '.*')).toBeNull();
  expect(googleAvatar('https://lh3.googleusercontent.com/photo')).toBeTruthy();
  for (const url of ['http://lh3.googleusercontent.com/photo', 'https://googleusercontent.com.attacker.test/photo', 'https://attacker.test/photo', 'https://me:secret@lh3.googleusercontent.com/photo']) expect(googleAvatar(url)).toBeNull();
  expect(metadataProfile({ avatar_url: 'https://lh3.googleusercontent.com/photo', avatar_removed: true }, userId).avatarUrl).toBeNull();
});
it('checks actual photo signatures and enforces size', () => {
  expect(avatarType(new Uint8Array([137,80,78,71,13,10,26,10]))).toBe('image/png');
  expect(avatarType(new Uint8Array([255,216,255]))).toBe('image/jpeg');
  expect(avatarType(new TextEncoder().encode('RIFFxxxxWEBP'))).toBe('image/webp');
  for (const bytes of [new Uint8Array(), new TextEncoder().encode('<svg/>'), new Uint8Array(MAX_AVATAR_BYTES + 1)]) expect(() => avatarType(bytes)).toThrow();
});
it('local profile does not render external URL or invalid data URI', () => {
  expect(localProfile('{"displayName":"Ana","avatarUrl":"https://attacker.test/pixel"}').avatarUrl).toBeNull();
  expect(() => localProfile('null')).toThrow();
  expect(localProfile('{"displayName":"Ana","avatarUrl":"data:image/png;base64,iVBORw=="}').avatarUrl).toBeTruthy();
});
it('Google da prévia só começa em localhost:8081', () => {
  expect(googleWebStartError('http://localhost:8081')).toBeNull();
  expect(googleWebStartError('http://localhost:8082')).toMatch(/8081/);
  expect(googleWebStartError('http://192.168.2.9:8081')).toMatch(/IP da rede/);
});
it('OAuth callback rejects unexpected origin, path, credential injection, errors and ambiguous codes', () => {
  const expected = 'http://localhost:8081/auth/callback';
  expect(callbackCode(`${expected}?code=valid`, expected)).toBe('valid');
  expect(callbackCode('gestao://auth/callback?code=valid', 'gestao://auth/callback')).toBe('valid');
  for (const url of ['https://attacker.test/auth/callback?code=valid', 'http://localhost:8081/other?code=valid', `${expected}?error=denied`, `${expected}?code=a&code=b`, expected, 'http://user@localhost:8081/auth/callback?code=valid']) expect(() => callbackCode(url, expected)).toThrow();
});
it('only PKCE verifier survives a redirect; access and refresh tokens stay in memory', () => {
  const data = new Map<string, string>(), durable = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k,v); }, removeItem: (k: string) => { data.delete(k); } };
  const first = previewAuthStorage(() => durable);
  first.setItem('sb-test-auth-token', 'SECRET_SESSION'); first.setItem('sb-test-auth-token-code-verifier', 'VERIFIER');
  const afterRedirect = previewAuthStorage(() => durable);
  expect(afterRedirect.getItem('sb-test-auth-token')).toBeNull(); expect(afterRedirect.getItem('sb-test-auth-token-code-verifier')).toBe('VERIFIER');
  expect([...data.values()]).not.toContain('SECRET_SESSION');
  afterRedirect.removeItem('sb-test-auth-token-code-verifier'); expect(data.size).toBe(0);
});
