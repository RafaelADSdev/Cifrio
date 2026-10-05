import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { Text, useWindowDimensions, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useFinance } from '../state/FinanceProvider';
import { Box, Button, colors, Field, fonts, GoogleButton, Icon, Loading, Notice, Page, styles } from '../ui/components';
import { signInGoogle } from '../lib/googleAuth';
export default function Welcome() {
  const { mode, loading, startDemo, error: contextError } = useFinance();
  const wide = useWindowDimensions().width >= 800;
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  async function google() {
    setMessage(''); setBusy(true);
    try { if (await signInGoogle() === 'cancelled') setMessage('Acesso cancelado. Você pode tentar novamente.'); }
    catch { setMessage('Não foi possível abrir o acesso Google. Confira a conexão e a configuração do provedor.'); }
    finally { setBusy(false); }
  }
  if (mode !== 'welcome') return <Redirect href="/(tabs)" />;
  async function auth(signup: boolean) {
    setMessage(''); setBusy(true);
    try {
      if (!supabase) throw new Error('Configure o Supabase para usar uma conta online.');
      if (!email.includes('@') || password.length < 8) throw new Error('Informe e-mail válido e senha de pelo menos 8 caracteres.');
      const { data, error } = signup ? await supabase.auth.signUp({ email: email.trim(), password }) : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error('Não foi possível acessar. Confira os dados e tente novamente.');
      if (!data.session) setMessage('Confira seu e-mail para confirmar o cadastro.');
    } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  }
  return <Page title="Seu dinheiro, com clareza." subtitle="Contas, gastos e compromissos em um só lugar.">
    {loading ? <Loading /> : <>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 20 }}>
        <View style={{ backgroundColor: colors.dark, borderRadius: 16, padding: 28, gap: 20, flex: wide ? 1 : undefined, boxShadow: '0 12px 24px rgba(4, 36, 83, 0.16)' }}>
          <View style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: colors.accent }} />
          <Text style={{ fontFamily: fonts.display, fontSize: 32, lineHeight: 39, letterSpacing: -0.8, color: colors.onDark }}>Mais clareza.{ '\n' }Menos dinheiro{ '\n' }sem destino.</Text>
          <Text style={{ fontFamily: fonts.regular, color: colors.mutedDark, lineHeight: 23, fontSize: 14 }}>Veja suas contas, organize seus gastos e acompanhe o que ainda está por vir.</Text>
          <View style={{ gap: 16, borderTopWidth: 1, borderTopColor: colors.lineOnDark, paddingTop: 20 }}>{[{ icon: 'briefcase' as const, text: 'Contas e movimentações em um só lugar' }, { icon: 'credit-card' as const, text: 'Compras, parcelas e faturas projetadas' }, { icon: 'file-text' as const, text: 'Extratos CSV e OFX com revisão' }].map(item => <View key={item.text} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Icon name={item.icon} color={colors.accent} size={18} /><Text style={{ fontFamily: fonts.regular, color: colors.onDark, fontSize: 13, lineHeight: 21, flex: 1 }}>{item.text}</Text></View>)}</View>
          {!wide && <View style={{ gap: 8 }}><Button title="Abrir teste local" secondary icon="arrow-right" onPress={() => void startDemo()} disabled={busy} /><Text style={{ fontFamily: fonts.regular, color: colors.mutedDark, fontSize: 12, lineHeight: 19 }}>Teste neste dispositivo. Evite dados sensíveis.</Text></View>}
        </View>
        <View style={{ flex: wide ? 1 : undefined, gap: 16 }}>
          <Box title="Sua conta online">{supabase ? <><Text style={styles.muted}>Entre para acessar os registros associados à sua conta. A integração do banco ainda está em validação.</Text><GoogleButton onPress={() => void google()} disabled={busy} /><Text style={[styles.muted, { textAlign: 'center' }]}>ou use seu e-mail</Text><Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" /><Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" /><Button title="Entrar" icon="arrow-right" onPress={() => void auth(false)} disabled={busy} /><Button title="Criar conta" secondary onPress={() => void auth(true)} disabled={busy} /></> : <Text style={styles.muted}>A conexão online estará disponível após a configuração do projeto Supabase.</Text>}</Box>
        </View>
      </View>
    </>}
    {!!(message || contextError) && <Notice error>{message || contextError}</Notice>}
    <Text style={styles.muted}>A sincronização bancária ainda não está habilitada nesta versão.</Text>
  </Page>;
}
