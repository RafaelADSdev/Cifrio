import { Redirect, Tabs } from 'expo-router';
import { ColorValue, Text, View } from 'react-native';
import { useFinance } from '../../state/FinanceProvider';
import { colors, Loading, styles } from '../../ui/components';
const icon = (symbol: string) => ({ color }: { color: ColorValue }) => <Text style={{ fontSize: 21, color }} accessible={false}>{symbol}</Text>;
export default function TabsLayout() {
  const { mode, loading, error } = useFinance();
  if (mode === 'welcome') return <Redirect href="/" />;
  return <View style={{ flex: 1 }}>
    {mode === 'demo' && <View style={{ backgroundColor: colors.soft, padding: 8 }}><Text style={[styles.muted, { textAlign: 'center', fontSize: 12 }]}>TESTE LOCAL · dados neste dispositivo · sem conexão bancária</Text></View>}
    {loading && <Loading />}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: { minHeight: 64, paddingTop: 8 } }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: icon('◷') }} />
      <Tabs.Screen name="transactions" options={{ title: 'Extrato', tabBarIcon: icon('⇄') }} />
      <Tabs.Screen name="cards" options={{ title: 'Cartões', tabBarIcon: icon('▱') }} />
      <Tabs.Screen name="imports" options={{ title: 'Importar', tabBarIcon: icon('↓') }} />
      <Tabs.Screen name="accounts" options={{ title: 'Contas', tabBarIcon: icon('▤') }} />
    </Tabs>
  </View>;
}
