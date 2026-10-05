import type { User } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import { avatarType, metadataProfile, ownAvatarPath, Profile, profileName } from '../domain/profile';
import { supabase } from './supabase';
export type ProfilePhoto = { bytes: Uint8Array; dataUrl: string };
const BUCKET = 'profile-avatars';
export async function readProfile(user: User): Promise<Profile> {
  const profile = metadataProfile(user.user_metadata, user.id);
  if (profile.avatarPath) {
    const { data, error } = await supabase!.storage.from(BUCKET).createSignedUrl(profile.avatarPath, 3600);
    if (error) throw new Error('Não foi possível carregar a foto privada. Verifique o Storage e tente atualizar.');
    profile.avatarUrl = data.signedUrl;
  }
  return profile;
}
export async function writeProfile(userId: string, name: string, photo: ProfilePhoto | null | undefined): Promise<{ profile: Profile; warning: string }> {
  if (!supabase) throw new Error('Conexão online indisponível.');
  const displayName = profileName(name);
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || auth.user?.id !== userId) throw new Error('Entre novamente antes de editar seu perfil.');
  const previousPath = ownAvatarPath(auth.user.user_metadata.avatar_path, userId);
  let uploaded: string | null = null;
  if (photo) {
    const contentType = avatarType(photo.bytes), extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[contentType];
    uploaded = `${userId}/${Crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(BUCKET).upload(uploaded, photo.bytes.buffer.slice(photo.bytes.byteOffset, photo.bytes.byteOffset + photo.bytes.byteLength) as ArrayBuffer, { contentType, upsert: false });
    if (error) throw new Error('Não foi possível enviar a foto. Verifique o bucket privado e a migração de Storage.');
  }
  const data: Record<string, unknown> = { display_name: displayName };
  if (photo !== undefined) { data.avatar_path = uploaded; data.avatar_removed = photo === null; data.avatar_url = null; }
  const { data: updated, error } = await supabase.auth.updateUser({ data });
  if (error || !updated.user) {
    if (uploaded) {
      const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([uploaded]);
      if (cleanupError) throw new Error('O perfil não foi salvo e a foto enviada não pôde ser removida. Solicite limpeza do Storage antes de tentar novamente.');
    }
    throw new Error('Não foi possível salvar o perfil. Tente novamente.');
  }
  let warning = '';
  if (photo !== undefined && previousPath && previousPath !== uploaded) {
    const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([previousPath]);
    if (cleanupError) warning = 'Perfil salvo, mas a foto anterior não foi removida do Storage. Solicite a limpeza antes de tratar a exclusão como concluída.';
  }
  let profile = metadataProfile(updated.user.user_metadata, userId);
  try { profile = await readProfile(updated.user); }
  catch { warning = warning || 'Perfil salvo. A foto privada não pôde ser exibida agora; tente atualizar.'; }
  return { profile, warning };
}
