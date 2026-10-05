import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { FinanceState } from '../domain/model';
export async function exportRecords(state: FinanceState) {
  const name = `gestao-registros-${new Date().toISOString().slice(0, 10)}.json`;
  const content = JSON.stringify({ format: 'gestao-export-v1', exportedAt: new Date().toISOString(), currency: 'BRL', amountsInCents: true, ...state }, null, 2);
  return exportJson(name, content);
}
export async function exportJson(name: string, content: string) {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); return;
  }
  if (!await Sharing.isAvailableAsync()) throw new Error('Compartilhamento indisponível neste dispositivo.');
  const file = new File(Paths.cache, name);
  try { file.create({ overwrite: true }); file.write(content); await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' }); }
  finally { if (file.exists) file.delete(); }
}
