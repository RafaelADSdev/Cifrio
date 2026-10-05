import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { ImportPreview, ImportRow, importEntries, mapCsv, parseOfx, splitCsv } from '../../domain/imports';
import { money } from '../../domain/money';
import { newId, useFinance } from '../../state/FinanceProvider';
import { Box, Button, Choices, colors, Icon, Notice, Page, styles } from '../../ui/components';
export default function Imports() {
  const { state, mutate, busy } = useFinance();
  const [account, setAccount] = useState(state.accounts[0]?.id ?? ''), [fileName, setFileName] = useState(''), [fileKey, setFileKey] = useState(''), [preview, setPreview] = useState<ImportPreview | null>(null), [ofx, setOfx] = useState<ImportRow[]>([]);
  const [mapping, setMapping] = useState({ date: 0, description: 1, amount: 2 }), [selected, setSelected] = useState<number[]>([]), [message, setMessage] = useState(''), [reading, setReading] = useState(false);
  const rows = preview ? mapCsv(preview, mapping) : ofx;
  async function pick() {
    setMessage(''); setReading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!/\.(csv|ofx)$/i.test(asset.name)) throw new Error('Esta versão importa CSV e OFX. PDF bancário será liberado após validar o layout do seu banco.');
      if ((asset.size ?? 0) > 2_000_000) throw new Error('Use um arquivo de até 2 MB.');
      const text = asset.file ? await asset.file.text() : await new File(asset.uri).text();
      if (text.includes('\uFFFD')) throw new Error('Salve o arquivo como UTF-8 e tente novamente.');
      const key = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
      if (/\.ofx$/i.test(asset.name)) { const parsed = parseOfx(text); setOfx(parsed); setPreview(null); setSelected(parsed.filter(r => !r.error).map(r => r.line)); }
      else { const parsed = splitCsv(text); setPreview(parsed); setOfx([]); setMapping({ date: 0, description: Math.min(1, parsed.headers.length - 1), amount: Math.min(2, parsed.headers.length - 1) }); setSelected(parsed.rawRows.map((_, i) => i + 2)); }
      setFileName(asset.name); setFileKey(key);
    } catch (e) { setMessage((e as Error).message); } finally { setReading(false); }
  }
  async function confirm() {
    setMessage('');
    try {
      if (!account) throw new Error('Selecione uma conta.');
      const chosen = rows.filter(r => selected.includes(r.line));
      if (!chosen.length) throw new Error('Selecione ao menos uma linha.');
      const entries = importEntries(chosen, account, fileKey, newId), before = state.entries.length;
      const duplicates = entries.filter(e => state.entries.some(old => old.accountId === account && old.sourceKey === e.sourceKey)).length;
      await mutate('entries', entries);
      setMessage(`${entries.length - duplicates} movimentações importadas. ${duplicates} já existentes foram ignoradas.`); setPreview(null); setOfx([]); setFileName(''); setSelected([]);
    } catch (e) { setMessage((e as Error).message); }
  }
  return <Page title="Importar extrato" subtitle="Menos digitação. Mais controle.">
    <Box title="Escolha a origem"><Choices label="Conta do extrato" value={account} options={state.accounts.map(a => ({ value: a.id, label: a.name }))} onChange={setAccount} />{!state.accounts.length && <Notice>Cadastre uma conta primeiro.</Notice>}<View style={{ alignItems: 'center', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 12, padding: 28, gap: 16 }}><Icon name="file-text" size={32} color={colors.primary} /><Text style={styles.heading}>Traga seus registros</Text><Text style={[styles.muted, { textAlign: 'center', maxWidth: 360 }]}>CSV ou OFX, até 2 MB e 500 linhas. Você revisa tudo antes de salvar.</Text><Button title={reading ? 'Lendo arquivo…' : 'Escolher CSV ou OFX'} icon="upload" onPress={() => void pick()} disabled={reading || busy || !state.accounts.length} /></View><Text style={styles.muted}>Leitura no dispositivo. O arquivo original não é enviado ao servidor.</Text></Box>
    {preview && <Box title="Mapear colunas">{(['date', 'description', 'amount'] as const).map(field => <Choices key={field} label={{ date: 'Coluna da data', description: 'Coluna da descrição', amount: 'Coluna do valor' }[field]} value={String(mapping[field])} options={preview.headers.map((label, i) => ({ value: String(i), label: `${i + 1}. ${label}` }))} onChange={value => setMapping({ ...mapping, [field]: Number(value) })} />)}<Notice>Valor positivo = receita. Valor negativo = despesa. Revise a classificação depois da importação.</Notice></Box>}
    {!!rows.length && <Box title={`Revisar · ${fileName}`}><Notice>Importar o mesmo arquivo na mesma conta não duplica os registros. Arquivos diferentes com períodos sobrepostos precisam de revisão; valores e datas iguais podem ser compras distintas.</Notice>
      {rows.map(row => <Pressable key={row.line} accessibilityRole="checkbox" aria-checked={selected.includes(row.line)} accessibilityLabel={`Linha ${row.line} · ${row.error ? 'Precisa de revisão' : row.description}`} accessibilityState={{ checked: selected.includes(row.line) }} onPress={() => setSelected(old => old.includes(row.line) ? old.filter(n => n !== row.line) : [...old, row.line])} style={[styles.line, { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 }]}><Icon name={selected.includes(row.line) ? 'check-square' : 'square'} color={colors.primary} /><View style={{ flex: 1 }}><Text style={styles.text}>Linha {row.line} · {row.error ? 'Precisa de revisão' : row.description}</Text><Text style={row.error ? styles.error : styles.muted}>{row.error || `${row.date} · ${money(row.amount)}`}</Text></View></Pressable>)}
      <Button title="Confirmar importação" onPress={() => void confirm()} disabled={busy || reading} />
    </Box>}
    {!!message && <Notice>{message}</Notice>}
    <Box title="Sobre PDF e conexão automática"><Text style={styles.muted}>PDFs variam por banco e ainda não são importados. Precisamos validar um layout antes de habilitar a extração. Open Finance também permanece pendente de acesso ao fornecedor.</Text></Box>
  </Page>;
}
