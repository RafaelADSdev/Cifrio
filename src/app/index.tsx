import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useFinance } from '../state/FinanceProvider';
import { Box, Button, Field, Loading, Notice, Page, styles } from '../ui/components';
export default function Welcome() {
  const { mode, loading, startDemo, error: contextError } = useFinance();
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
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
    <Box><Text style={[styles.value, { fontSize: 36 }]}>Gestão</Text><Text style={styles.text}>Entenda o que entrou, o que saiu e o que ainda está por vir.</Text></Box>
    {loading ? <Loading /> : <>
      <Box title="Comece pelo teste local"><Text style={styles.muted}>Explore o app com registros de teste. Os dados ficam neste dispositivo e não são enviados aos bancos. Evite dados pessoais sensíveis neste modo.</Text><Button title="Abrir teste local" onPress={() => void startDemo()} disabled={busy} /></Box>
      <Box title="Sua conta online">{supabase ? <><Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /><Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry /><View style={styles.row}><Button title="Entrar" onPress={() => void auth(false)} disabled={busy} /><Button title="Criar conta" secondary onPress={() => void auth(true)} disabled={busy} /></View></> : <Text style={styles.muted}>A conexão online estará disponível após a configuração do projeto Supabase.</Text>}</Box>
    </>}
    {!!(message || contextError) && <Notice error>{message || contextError}</Notice>}
    <Text style={styles.muted}>A sincronização bancária ainda não está habilitada nesta versão.</Text>
  </Page>;
}
