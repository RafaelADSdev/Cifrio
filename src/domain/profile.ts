export type Profile = { displayName: string; avatarPath: string | null; avatarUrl: string | null };
export const blankProfile = (): Profile => ({ displayName: '', avatarPath: null, avatarUrl: null });
export const MAX_AVATAR_BYTES = 2_000_000;
export function profileName(input: string): string {
  const name = input.trim();
  if (!name || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name)) throw new Error('Use um nome de 1 a 80 caracteres, sem caracteres de controle.');
  return name;
}
export function avatarType(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' {
  if (!bytes.length || bytes.length > MAX_AVATAR_BYTES) throw new Error('Escolha uma foto de até 2 MB.');
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((n, i) => bytes[i] === n)) return 'image/png';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP') return 'image/webp';
  throw new Error('Use uma imagem JPEG, PNG ou WebP válida.');
}
export function ownAvatarPath(value: unknown, userId: string): string | null {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(userId)) return null;
  return typeof value === 'string' && new RegExp(`^${userId}/[a-f0-9-]{36}\\.(jpg|png|webp)$`).test(value) ? value : null;
}
export function googleAvatar(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'googleusercontent.com' || url.hostname.endsWith('.googleusercontent.com')) ? url.href : null; }
  catch { return null; }
}
export function metadataProfile(metadata: Record<string, unknown>, userId: string): Profile {
  const rawName = metadata.display_name ?? metadata.full_name ?? metadata.name;
  let displayName = ''; try { if (typeof rawName === 'string') displayName = profileName(rawName); } catch { /* Invalid provider metadata is not displayed. */ }
  return { displayName, avatarPath: ownAvatarPath(metadata.avatar_path, userId), avatarUrl: metadata.avatar_removed === true ? null : googleAvatar(metadata.avatar_url) };
}
export function localProfile(raw: string): Profile {
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  if (!parsed || typeof parsed !== 'object' || typeof parsed.displayName !== 'string') throw new Error('Perfil local inválido.');
  const displayName = parsed.displayName ? profileName(parsed.displayName) : '';
  const avatarUrl = typeof parsed.avatarUrl === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]*={0,2}$/.test(parsed.avatarUrl) && parsed.avatarUrl.length <= Math.ceil(MAX_AVATAR_BYTES * 4 / 3) + 100 ? parsed.avatarUrl : null;
  return { displayName, avatarPath: null, avatarUrl };
}
