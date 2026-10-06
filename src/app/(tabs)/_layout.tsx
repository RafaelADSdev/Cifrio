import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';
import Animated, { cancelAnimation, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { motionTokens, useMotionSettings } from '../../ui/motionPreferences';
import { ColorValue, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFinance } from '../../state/FinanceProvider';
import { colors, fonts, Icon, IconName, Loading, styles, systemBottomInset, systemTopInset, TAB_BAR_BODY } from '../../ui/components';
function TabIcon({ name, compact, color, focused }: { name: IconName; compact: boolean; color: ColorValue; focused: boolean }) {
  const { disabled } = useMotionSettings();
  const selection = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    if (disabled) { cancelAnimation(selection); selection.value = focused ? 1 : 0; }
    else selection.value = withTiming(focused ? 1 : 0, { duration: motionTokens.release, easing: motionTokens.easing, reduceMotion: ReduceMotion.Never });
  }, [focused, disabled, selection]);
  const indicator = useAnimatedStyle(() => ({ opacity: selection.value }));
  return <View style={compact ? { width: 52, height: 32, alignItems: 'center', justifyContent: 'center' } : undefined}>
    {compact && <Animated.View pointerEvents="none" style={[{ position: 'absolute', inset: 0, borderRadius: 16, backgroundColor: colors.soft }, indicator]} />}
    <Icon name={name} color={color} size={22} />
  </View>;
}
const icon = (name: IconName, compact = false) => ({ color, focused }: { color: ColorValue; focused: boolean }) => <TabIcon name={name} compact={compact} color={color} focused={focused} />;
export default function TabsLayout() {
  const { mode, loading, error } = useFinance();
  const insets = useSafeAreaInsets();
  const expanded = useWindowDimensions().width >= 1000;
  const bottomInset = systemBottomInset(insets.bottom);
  const tabBarMargin = bottomInset + 12;
  const topInset = systemTopInset(insets.top);
  if (loading) return <View style={{ flex: 1, paddingTop: topInset, backgroundColor: colors.bg }}><Loading /></View>;
  if (mode === 'welcome') return <Redirect href="/" />;
  return <View style={{ flex: 1, backgroundColor: colors.bg }}>
    {mode === 'demo' && <View style={{ backgroundColor: colors.soft, paddingTop: topInset, paddingBottom: 8, paddingHorizontal: 12 }}><Text style={[styles.muted, { textAlign: 'center', fontSize: 11 }]}>Teste local · dados neste dispositivo · sem conexão bancária</Text></View>}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Tabs safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }} screenOptions={{ headerShown: false, tabBarPosition: expanded ? 'left' : 'bottom', tabBarLabelPosition: expanded ? 'beside-icon' : 'below-icon', tabBarActiveTintColor: colors.ink, tabBarInactiveTintColor: colors.muted, tabBarActiveBackgroundColor: expanded ? colors.soft : 'transparent', tabBarIconStyle: expanded ? undefined : { width: 52, height: 32 }, tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: expanded ? 13 : 11, lineHeight: expanded ? 18 : 16, marginTop: expanded ? 0 : 4, flexShrink: 0 }, tabBarItemStyle: expanded ? { marginVertical: 4, borderRadius: 12, minHeight: 52 } : { marginHorizontal: 2, minHeight: 56, paddingVertical: 4 }, tabBarStyle: expanded ? { backgroundColor: colors.surface, borderRightColor: colors.border, width: 188, minWidth: 188, paddingTop: 28, paddingHorizontal: 12, paddingBottom: bottomInset } : { backgroundColor: colors.surface, borderTopWidth: 0, borderWidth: 1, borderColor: colors.border, borderRadius: 32, marginHorizontal: 12, marginBottom: tabBarMargin, height: TAB_BAR_BODY, paddingHorizontal: 4, paddingTop: 4, paddingBottom: 4 } }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: icon('home', !expanded) }} />
      <Tabs.Screen name="transactions" options={{ title: 'Extrato', tabBarIcon: icon('list', !expanded) }} />
      <Tabs.Screen name="cards" options={{ title: 'Cartões', tabBarIcon: icon('credit-card', !expanded) }} />
      <Tabs.Screen name="subscriptions" options={{ title: 'Assinaturas', href: expanded ? '/subscriptions' : null, tabBarIcon: icon('tv', !expanded) }} />
      <Tabs.Screen name="imports" options={{ title: 'Importar', href: expanded ? '/imports' : null, tabBarIcon: icon('download', !expanded) }} />
      <Tabs.Screen name="accounts" options={{ title: 'Contas', tabBarIcon: icon('briefcase', !expanded) }} />
      <Tabs.Screen name="more" options={{ title: 'Mais', href: expanded ? null : undefined, tabBarIcon: icon('more-horizontal', !expanded) }} />
    </Tabs>
  </View>;
}
