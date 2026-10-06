import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { FinanceProvider, useFinance } from '../state/FinanceProvider';
import { ProfileProvider } from '../state/ProfileProvider';
import { colors } from '../ui/components';
import { useFonts } from 'expo-font';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import Feather from '@expo/vector-icons/Feather';
import { Loading } from '../ui/components';
if (Platform.OS !== 'web') void SplashScreen.preventAutoHideAsync().catch(() => {});
export default function Layout() {
  const [ready, fontError] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold, ...Feather.font });
  useEffect(() => {
    if (ready || fontError) void SplashScreen.hideAsync().catch(() => {});
  }, [ready, fontError]);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined' || document.getElementById('cifrio-surfaces')) return;
    const style = document.createElement('style');
    style.id = 'cifrio-surfaces';
    style.textContent = 'html{color-scheme:light;background:#F4F8FC}::selection{background:#D7E9FB;color:#042453}input,textarea{caret-color:#0474E0}*{scrollbar-width:thin;scrollbar-color:#5C8FBE #F4F8FC}*:focus-visible{outline:2px solid #0474E0;outline-offset:3px}';
    document.head.appendChild(style);
  }, []);
  if (!ready && !fontError) return <SafeAreaProvider initialMetrics={initialWindowMetrics}><Loading /></SafeAreaProvider>;
  return <SafeAreaProvider initialMetrics={initialWindowMetrics}><FinanceProvider><ProfileProvider><StatusBar style="dark" /><AppStack /></ProfileProvider></FinanceProvider></SafeAreaProvider>;
}

function AppStack() {
  const { mode, loading } = useFinance();
  if (loading) return <Loading />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
    <Stack.Protected guard={mode === 'welcome'}><Stack.Screen name="index" /></Stack.Protected>
    <Stack.Protected guard={mode !== 'welcome'}><Stack.Screen name="(tabs)" /></Stack.Protected>
  </Stack>;
}
