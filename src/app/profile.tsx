import { useEffect, useState } from 'react';
import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';
import { useFinance } from '../state/FinanceProvider';
import { useProfile } from '../state/ProfileProvider';
import { ProfilePhoto } from '../lib/profileRepository';
import { pickProfilePhoto } from '../lib/profilePhoto';
import { exportJson } from '../lib/export';
import { Avatar, Box, Button, colors, Field, Loading, Notice, Page, styles } from '../ui/components';
export default function ProfileScreen() {
  const { mode, session, leave } = useFinance();
  const { profile, loading, saving, error, refresh, save } = useProfile();
  const [name, setName] = useState(profile.displayName), [photo, setPhoto] = useState<ProfilePhoto | null | undefined>(undefined), [message, setMessage] = useState(''), [failed, setFailed] = useState(false), [picking, setPicking] = useState(false);
  useEffect(() => { setName(profile.displayName); }, [profile.displayName]);
  if (mode === 'welcome') return <Redirect href="/" />;
  const busy = loading || saving || picking, preview = photo === undefined ? profile.avatarUrl : photo?.dataUrl;
  async function choose() { setMessage(''); setFailed(false); setPicking(true); try { const selected = await pickProfilePhoto(); if (selected) setPhoto(selected); } catch (e) { setFailed(true); setMessage((e as Error).message); } finally { setPicking(false); } }
  async function submit() { setMessage(''); setFailed(false); try { const warning = await save(name, photo); setPhoto(undefined); setMessage(warning || 'Perfil salvo.'); } catch (e) { setFailed(true); setMessage((e as Error).message); } }
  return <Page title="Seu perfil" subtitle="Um Cifrio com a sua cara.">
    <Button title="Voltar" icon="arrow-left" secondary onPress={() => router.back()} />
    <Box title="Como você aparece"><View style={{ alignItems: 'center', gap: 12 }}><Avatar size={104} name={name} uri={preview} /><Text style={styles.muted}>JPEG, PNG ou WebP · até 2 MB</Text></View>
      <View style={styles.row}><Button title={picking ? 'Escolhendo foto…' : 'Alterar foto'} secondary icon="camera" onPress={() => void choose()} disabled={busy} />{preview && <Button title="Remover foto" secondary icon="trash-2" onPress={() => setPhoto(null)} disabled={busy} />}</View>
      <Field label="Nome de exibição" value={name} onChangeText={setName} placeholder="Como prefere ser chamado?" autoComplete="name" maxLength={80} editable={!busy} />
      {mode === 'remote' && <Text style={styles.muted}>E-mail da conta: {session?.user.email ?? 'Não informado'}. O e-mail não é alterado por este formulário.</Text>}
      {loading && <Loading />}<Button title={saving ? 'Salvando perfil…' : 'Salvar perfil'} icon="check" onPress={() => void submit()} disabled={busy} />
    </Box>
    {!!message && <Notice error={failed}>{message}</Notice>}{!!error && <Notice error>{error}</Notice>}
    <Box title="Privacidade e acesso"><Text style={styles.muted}>{mode === 'demo' ? 'Perfil de teste salvo só neste dispositivo. Evite dados pessoais sensíveis.' : 'Nome nos dados de apresentação da sua conta. Fotos enviadas ao Storage privado, acessíveis por links temporários.'}</Text><Text style={styles.muted}>A foto escolhida só é enviada quando você toca em Salvar perfil. Remover e salvar limpa a foto atual.</Text>
      <Button title="Atualizar perfil" secondary icon="refresh-cw" disabled={busy} onPress={() => void refresh()} />
      <Button title="Exportar meu perfil (JSON)" secondary icon="download" disabled={busy} onPress={() => void exportJson('cifrio-perfil.json', JSON.stringify({ format: 'cifrio-profile-v1', exportedAt: new Date().toISOString(), displayName: profile.displayName, avatarPath: profile.avatarPath, ...(mode === 'demo' ? { avatarDataUrl: profile.avatarUrl } : {}) }, null, 2)).catch(() => { setFailed(true); setMessage('Não foi possível exportar seu perfil.'); })} />
      <Button title="Sair da sessão" secondary disabled={busy} onPress={() => void leave().catch(() => { setFailed(true); setMessage('Não foi possível sair agora.'); })} />
    </Box>
  </Page>;
}
