import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { FinanceProvider } from '../state/FinanceProvider';
import { colors } from '../ui/components';
import { useFonts } from 'expo-font';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import Feather from '@expo/vector-icons/Feather';
import { Loading } from '../ui/components';
export default function Layout() {
  const [ready, fontError] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold, ...Feather.font });
  if (!ready && !fontError) return <SafeAreaProvider initialMetrics={initialWindowMetrics}><Loading /></SafeAreaProvider>;
  return <SafeAreaProvider initialMetrics={initialWindowMetrics}><FinanceProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} /></FinanceProvider></SafeAreaProvider>;
}
