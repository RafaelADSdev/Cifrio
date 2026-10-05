import { beforeEach, expect, it, vi } from 'vitest';
const api = vi.hoisted(() => ({ getUser: vi.fn(), updateUser: vi.fn(), upload: vi.fn(), remove: vi.fn(), createSignedUrl: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({ supabase: { auth: { getUser: api.getUser, updateUser: api.updateUser }, storage: { from: () => ({ upload: api.upload, remove: api.remove, createSignedUrl: api.createSignedUrl }) } } }));
vi.mock('expo-crypto', () => ({ randomUUID: () => '10000000-0000-4000-8000-000000000002' }));
import { writeProfile } from '../src/lib/profileRepository';
const id = '00000000-0000-4000-8000-000000000001', previousPath = `${id}/10000000-0000-4000-8000-000000000001.png`;
const photo = { bytes: new Uint8Array([137,80,78,71,13,10,26,10]), dataUrl: 'data:image/png;base64,iVBORw==' };
beforeEach(() => {
  vi.resetAllMocks(); api.getUser.mockResolvedValue({ data: { user: { id, user_metadata: { avatar_path: previousPath } } }, error: null });
  api.upload.mockResolvedValue({ error: null }); api.remove.mockResolvedValue({ error: null }); api.createSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://fixture.supabase.co/photo' }, error: null });
  api.updateUser.mockImplementation(async ({ data }) => ({ data: { user: { id, user_metadata: { ...data } } }, error: null }));
});
it('rejects a session for a different user before uploading', async () => {
  await expect(writeProfile('00000000-0000-4000-8000-000000000099','Ana',photo)).rejects.toThrow('Entre novamente'); expect(api.upload).not.toHaveBeenCalled();
});
it('replacement uploads a new object and removes old after metadata is saved', async () => {
  const result = await writeProfile(id,'Ana',photo); expect(result.profile.displayName).toBe('Ana'); expect(result.profile.avatarPath).not.toBe(previousPath); expect(api.remove).toHaveBeenCalledWith([previousPath]);
  expect(api.remove.mock.invocationCallOrder[0]).toBeGreaterThan(api.updateUser.mock.invocationCallOrder[0]);
});
it('failed profile save reports failed cleanup of a newly uploaded object', async () => {
  api.updateUser.mockResolvedValue({ data: {}, error: new Error('Unavailable') }); api.remove.mockResolvedValue({ error: new Error('Unavailable') });
  await expect(writeProfile(id,'Ana',photo)).rejects.toThrow('foto enviada não pôde ser removida');
});
it('old-photo cleanup failure is reported rather than disguised as completed deletion', async () => {
  api.remove.mockResolvedValue({ error: new Error('Unavailable') }); const result = await writeProfile(id,'Ana',null); expect(result.profile.avatarPath).toBeNull(); expect(result.profile.avatarUrl).toBeNull(); expect(result.warning).toContain('não foi removida');
});
