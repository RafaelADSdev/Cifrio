import React, { useState } from 'react';
import { ActivityIndicator, ColorValue, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, useWindowDimensions, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { router, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const colors = { bg: '#F4F6F8', surface: '#FFFFFF', ink: '#172B42', muted: '#56677B', primary: '#17664F', soft: '#E8F2ED', border: '#DDE4EA', negative: '#B2403B', dark: '#142A40', onDark: '#FFFFFF', mutedDark: '#BACBD8', accent: '#D9EFB6', pale: '#EDF1F5' };
export const fonts = { regular: Platform.OS === 'ios' ? undefined : 'Manrope_400Regular', medium: 'Manrope_500Medium', bold: 'Manrope_700Bold', display: 'Manrope_800ExtraBold' };
export type IconName = React.ComponentProps<typeof Feather>['name'];
export function Icon({ name, size = 20, color = colors.ink }: { name: IconName; size?: number; color?: ColorValue }) { return <Feather name={name} size={size} color={color} accessible={false} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />; }
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg }, content: { width: '100%', maxWidth: 1120, alignSelf: 'center', padding: 20, gap: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontFamily: fonts.display, color: colors.ink, letterSpacing: -0.7 }, heading: { fontSize: 18, fontFamily: fonts.bold, color: colors.ink },
  text: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.ink }, muted: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, color: colors.muted },
  box: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  value: { fontSize: 28, fontFamily: fonts.display, color: colors.ink, letterSpacing: -0.6, fontVariant: ['tabular-nums'] },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 18, minHeight: 48, paddingVertical: 12, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 14, lineHeight: 20, fontFamily: fonts.bold, color: colors.onDark, flexShrink: 1, textAlign: 'center' },
  input: { fontFamily: fonts.regular, color: colors.ink, backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 14, minHeight: 52, fontSize: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, minHeight: 48, justifyContent: 'center', backgroundColor: colors.bg, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  note: { borderRadius: 12, padding: 16, backgroundColor: colors.pale, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, error: { fontFamily: fonts.regular, color: colors.negative, fontSize: 14, lineHeight: 22 },
  line: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 14, gap: 8 }, badge: { backgroundColor: colors.pale, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
});
const ANDROID_GESTURE_INSET = 48;
export function systemBottomInset(reported: number) {
  if (Platform.OS !== 'android' || reported > 0) return reported;
  const reserved = Dimensions.get('screen').height - Dimensions.get('window').height;
  return reserved > 24 ? reported : ANDROID_GESTURE_INSET;
}
export function Brand({ dark = false }: { dark?: boolean }) { return <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: dark ? colors.accent : colors.dark, alignItems: 'center', justifyContent: 'center' }}><Icon name="layers" size={19} color={dark ? colors.dark : colors.onDark} /></View><Text style={{ fontFamily: fonts.display, fontSize: 20, color: dark ? colors.onDark : colors.ink, letterSpacing: -0.5 }}>gestão</Text></View>; }
export function Page({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  const insets = useSafeAreaInsets(), { width } = useWindowDimensions();
  const inTabs = (useSegments() as readonly string[]).includes('(tabs)');
  return <View style={[styles.page, { paddingTop: inTabs ? 0 : insets.top, paddingBottom: inTabs ? 0 : systemBottomInset(insets.bottom), paddingLeft: insets.left, paddingRight: insets.right }]}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingHorizontal: width < 360 ? 16 : width > 900 ? 36 : 20 }]}>
    <View style={[styles.row, { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }]}><Brand />{inTabs ? <Pressable accessibilityRole="button" accessibilityLabel="Abrir suas contas" onPress={() => router.navigate('/accounts')} style={{ minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: 12 }}><Icon name="user" /></Pressable> : <Icon name="shield" color={colors.primary} />}</View>
    <View style={styles.row}><View style={{ gap: 4, flex: 1 }}><Text accessibilityRole="header" style={styles.title}>{title}</Text>{subtitle && <Text style={styles.muted}>{subtitle}</Text>}</View>{action}</View>{children}
  </ScrollView></View>;
}
export function Button({ title, onPress, disabled, secondary, icon, label, danger }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; icon?: IconName; label?: string; danger?: boolean }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => [styles.button, secondary && { backgroundColor: colors.pale }, danger && { backgroundColor: '#FAECEB' }, focused && { outlineColor: colors.primary, outlineWidth: 2, outlineOffset: 3 }, { opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}>{icon && <Icon name={icon} size={18} color={danger ? colors.negative : secondary ? colors.ink : colors.onDark} />}<Text style={[styles.buttonText, secondary && { color: colors.ink }, danger && { color: colors.negative }]}>{label ?? title}</Text></Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  return <View style={{ gap: 8 }}><Text style={[styles.text, { fontFamily: fonts.medium, fontSize: 13 }]}>{label}</Text><TextInput {...props} accessibilityLabel={label} onFocus={e => { setFocused(true); props.onFocus?.(e); }} onBlur={e => { setFocused(false); props.onBlur?.(e); }} placeholderTextColor={colors.muted} style={[styles.input, focused && { borderColor: colors.primary, backgroundColor: colors.surface }, props.style]} /></View>;
}
export function Choices<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return <View style={{ gap: 8 }}><Text style={[styles.text, { fontFamily: fonts.medium, fontSize: 13 }]}>{label}</Text><View accessibilityRole="radiogroup" accessibilityLabel={label} style={[styles.row, { justifyContent: 'flex-start', gap: 8 }]}>{options.map(option => <Pressable key={option.value} accessibilityRole="radio" aria-checked={value === option.value} accessibilityState={{ checked: value === option.value }} onPress={() => onChange(option.value)} style={[styles.chip, value === option.value && { backgroundColor: colors.dark, borderColor: colors.dark }]}><Text style={{ fontFamily: fonts.medium, fontSize: 13, color: value === option.value ? colors.onDark : colors.ink }}>{option.label}</Text></Pressable>)}</View></View>;
}
export function Box({ title, children }: { title?: string; children: React.ReactNode }) { return <View style={styles.box}>{title && <Text accessibilityRole="header" aria-level={2} style={styles.heading}>{title}</Text>}{children}</View>; }
export function Notice({ children, error }: { children: React.ReactNode; error?: boolean }) { return <View style={[styles.note, error && { backgroundColor: '#FAECEB' }]}><Icon name={error ? 'alert-circle' : 'info'} size={17} color={error ? colors.negative : colors.muted} /><Text accessibilityRole={error ? 'alert' : undefined} accessibilityLiveRegion="polite" style={[error ? styles.error : styles.muted, { flex: 1 }]}>{children}</Text></View>; }
export function Empty({ icon, title, detail, children }: { icon: IconName; title: string; detail: string; children?: React.ReactNode }) { return <View style={{ alignItems: 'center', paddingVertical: 24, gap: 12 }}><View style={{ width: 56, height: 56, backgroundColor: colors.pale, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={25} color={colors.muted} /></View><Text style={[styles.heading, { textAlign: 'center' }]}>{title}</Text><Text style={[styles.muted, { maxWidth: 320, textAlign: 'center' }]}>{detail}</Text>{children}</View>; }
export function MonthPicker({ month, previous, next, labelPrevious = 'Mês anterior', labelNext = 'Próximo mês' }: { month: string; previous: () => void; next: () => void; labelPrevious?: string; labelNext?: string }) {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`));
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 4 }}><Pressable accessibilityRole="button" accessibilityLabel={labelPrevious} onPress={previous} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><Icon name="chevron-left" /></Pressable><View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexShrink: 1 }}><Icon name="calendar" size={16} color={colors.muted} /><Text style={[styles.text, { fontFamily: fonts.bold, fontSize: 13, textTransform: 'capitalize', flexShrink: 1 }]}>{label}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={labelNext} onPress={next} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><Icon name="chevron-right" /></Pressable></View>;
}
export function Loading() { return <View style={{ padding: 24 }}><ActivityIndicator accessibilityLabel="Carregando dados" color={colors.primary} /><Text style={styles.muted}>Carregando seus registros…</Text></View>; }
