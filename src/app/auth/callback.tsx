import { useEffect, useRef, useState } from 'react';
import { Platform, Text } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { completeGoogleSignIn } from '../../lib/googleAuth';
import { Button, Loading, Notice, Page, styles } from '../../ui/components';
export default function Callback() {
  const url = Linking.useLinkingURL();
  const [error, setError] = useState('');
  const started = useRef(false), alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    const received = Platform.OS === 'web' ? window.location.href : url;
    if (!received || started.current) return;
    started.current = true;
    if (Platform.OS === 'web') window.history.replaceState({}, '', '/auth/callback');
    completeGoogleSignIn(received).then(() => { if (alive.current) router.replace('/(tabs)'); }).catch(() => { if (alive.current) setError('Não foi possível concluir o acesso Google. Volte e inicie o login novamente.'); });
  }, [url]);
  return <Page title="Concluindo seu acesso" subtitle="Retorno seguro ao Cifrio.">{error ? <><Notice error>{error}</Notice><Button title="Voltar para entrada" onPress={() => router.replace('/')} /></> : <><Loading /><Text style={styles.muted}>Aguarde a confirmação da sessão.</Text></>}</Page>;
}
