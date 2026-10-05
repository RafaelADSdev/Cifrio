import { Redirect, Tabs } from 'expo-router';
import { ColorValue, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFinance } from '../../state/FinanceProvider';
import { colors, fonts, Icon, IconName, Loading, styles, systemBottomInset } from '../../ui/components';
const icon = (name: IconName) => ({ color }: { color: ColorValue }) => <Icon name={name} color={color} size={21} />;
export default function TabsLayout() {
  const { mode, loading, error } = useFinance();
  const insets = useSafeAreaInsets();
  const expanded = useWindowDimensions().width >= 1000;
  const bottomInset = systemBottomInset(insets.bottom);
  if (mode === 'welcome') return <Redirect href="/" />;
  return <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.bg }}>
    {mode === 'demo' && <View style={{ backgroundColor: colors.soft, padding: 8 }}><Text style={[styles.muted, { textAlign: 'center', fontSize: 11 }]}>Teste local · dados neste dispositivo · sem conexão bancária</Text></View>}
    {loading && <Loading />}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Tabs safeAreaInsets={{ bottom: bottomInset }} screenOptions={{ headerShown: false, tabBarPosition: expanded ? 'left' : 'bottom', tabBarLabelPosition: expanded ? 'beside-icon' : 'below-icon', tabBarActiveTintColor: expanded ? colors.ink : colors.primary, tabBarInactiveTintColor: colors.muted, tabBarActiveBackgroundColor: expanded ? colors.soft : undefined, tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: expanded ? 13 : 10 }, tabBarItemStyle: expanded ? { marginVertical: 4, borderRadius: 12, minHeight: 52 } : { minHeight: 52 }, tabBarStyle: expanded ? { backgroundColor: colors.surface, borderRightColor: colors.border, width: 188, minWidth: 188, paddingTop: 28, paddingHorizontal: 12 } : { backgroundColor: colors.surface, borderTopColor: colors.border, height: 68 + bottomInset, paddingTop: 6, paddingBottom: bottomInset } }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: icon('grid') }} />
      <Tabs.Screen name="transactions" options={{ title: 'Extrato', tabBarIcon: icon('list') }} />
      <Tabs.Screen name="cards" options={{ title: 'Cartões', tabBarIcon: icon('credit-card') }} />
      <Tabs.Screen name="imports" options={{ title: 'Importar', tabBarIcon: icon('download') }} />
      <Tabs.Screen name="accounts" options={{ title: 'Contas', tabBarIcon: icon('briefcase') }} />
    </Tabs>
  </View>;
}
