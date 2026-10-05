import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FinanceProvider } from '../state/FinanceProvider';
export default function Layout() { return <SafeAreaProvider><FinanceProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></FinanceProvider></SafeAreaProvider>; }
