import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { avatarType, MAX_AVATAR_BYTES } from '../domain/profile';
import { ProfilePhoto } from './profileRepository';
export async function pickProfilePhoto(): Promise<ProfilePhoto | null> {
  // On web, call the picker directly from the user action to preserve activation.
  if (Platform.OS === 'ios') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new Error('Permita o acesso às fotos para escolher sua imagem. Você pode alterar isso nas configurações do aparelho.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if ((asset.fileSize ?? asset.file?.size ?? 0) > MAX_AVATAR_BYTES) throw new Error('Escolha uma foto de até 2 MB.');
  const buffer = asset.file ? await asset.file.arrayBuffer() : await new File(asset.uri).arrayBuffer();
  const bytes = new Uint8Array(buffer), contentType = avatarType(bytes);
  let binary = ''; for (let i = 0; i < bytes.length; i += 4096) binary += String.fromCharCode(...bytes.slice(i, i + 4096));
  return { bytes, dataUrl: `data:${contentType};base64,${btoa(binary)}` };
}
