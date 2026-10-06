import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ColorValue, Dimensions, Image, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TextInputProps, useWindowDimensions, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { router, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFinance } from '../state/FinanceProvider';
import { useProfile } from '../state/ProfileProvider';
import { SlidingLabel, usePressFeedback } from './motion';
import Animated from 'react-native-reanimated';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export const brandMark = require('../../assets/brand/cifrio-mark.png');
export const brandLogo = require('../../assets/brand/cifrio-logo.png');

export const colors = { bg: '#F4F8FC', surface: '#FFFFFF', ink: '#042453', muted: '#3E5674', primary: '#0474E0', onPrimary: '#FFFFFF', soft: '#D7E9FB', border: '#D5E3F0', negative: '#B2403B', dark: '#042453', onDark: '#FFFFFF', mutedDark: '#D5E4F5', accent: '#23D2BF', pale: '#E7F2FC', lineOnDark: '#5C8FBE', errorSurface: '#FAECEB' };
export const fonts = { regular: Platform.OS === 'ios' ? undefined : 'Manrope_400Regular', medium: 'Manrope_500Medium', bold: 'Manrope_700Bold', display: 'Manrope_800ExtraBold' };
export type IconName = React.ComponentProps<typeof Feather>['name'];
export function Icon({ name, size = 20, color = colors.ink }: { name: IconName; size?: number; color?: ColorValue }) { return <Feather name={name} size={size} color={color} accessible={false} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />; }
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg }, content: { width: '100%', maxWidth: 1120, alignSelf: 'center', padding: 20, gap: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontFamily: fonts.display, color: colors.ink, letterSpacing: -0.6 }, heading: { fontSize: 18, fontFamily: fonts.bold, color: colors.ink },
  text: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.ink }, muted: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, color: colors.muted },
  box: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 16, borderWidth: 1, borderColor: colors.border, boxShadow: '0 2px 8px rgba(4,36,83,0.04)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  value: { fontSize: 28, fontFamily: fonts.display, color: colors.ink, letterSpacing: -0.6, fontVariant: ['tabular-nums'] },
  button: { backgroundColor: colors.primary, borderRadius: 24, paddingHorizontal: 20, minHeight: 48, paddingVertical: 12, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 14, lineHeight: 20, fontFamily: fonts.bold, color: colors.onPrimary, flexShrink: 1, textAlign: 'center' },
  input: { fontFamily: fonts.regular, color: colors.ink, backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 14, minHeight: 52, fontSize: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, minHeight: 48, justifyContent: 'center', backgroundColor: colors.bg, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  note: { borderRadius: 12, padding: 16, backgroundColor: colors.pale, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, error: { fontFamily: fonts.regular, color: colors.negative, fontSize: 14, lineHeight: 22 },
  line: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 14, gap: 8 }, badge: { backgroundColor: colors.pale, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
});
const ANDROID_GESTURE_INSET = 48;
export const TAB_BAR_BODY = 72;
export function systemTopInset(reported: number) {
  if (Platform.OS !== 'android') return reported;
  const status = StatusBar.currentHeight ?? 0;
  return Math.max(reported, status);
}
export function systemBottomInset(reported: number) {
  if (Platform.OS !== 'android') return reported;
  const reserved = Dimensions.get('screen').height - Dimensions.get('window').height;
  const gesture = reserved <= 24;
  const minimum = gesture ? ANDROID_GESTURE_INSET : Math.max(reported, 16);
  return Math.max(reported, minimum);
}
/** Espaço reservado abaixo do conteúvel quando a tab bar flutuante está visível. */
export function bottomTabClearance(reportedBottom: number) {
  const inset = systemBottomInset(reportedBottom);
  const margin = inset + 12;
  return margin + TAB_BAR_BODY + inset + 20;
}
export function Brand() {
  return <View accessible accessibilityLabel="Cifrio" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingVertical: 2 }}>
    <Image source={brandMark} accessible={false} resizeMode="contain" style={{ width: 36, height: 36 }} />
    <Text style={{ fontFamily: fonts.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.5, color: colors.ink }}>cifrio</Text>
  </View>;
}
export function Avatar({ size = 40, name = '', uri }: { size?: number; name?: string; uri?: string | null }) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase();
  return uri && failedUri !== uri ? <Image source={{ uri }} accessibilityLabel="Foto do perfil" onError={() => setFailedUri(uri)} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.pale }} /> : <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.pale, alignItems: 'center', justifyContent: 'center' }}>{initials ? <Text style={{ fontFamily: fonts.bold, color: colors.ink, fontSize: size * 0.32 }}>{initials}</Text> : <Icon name="user" size={size * 0.45} />}</View>;
}
export function Page({ title, subtitle, children, action, compact = false }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode; compact?: boolean }) {
  const insets = useSafeAreaInsets(), { width } = useWindowDimensions();
  const inTabs = (useSegments() as readonly string[]).includes('(tabs)');
  const { profile } = useProfile();
  const { mode } = useFinance();
  const topInset = systemTopInset(insets.top);
  const pageTop = inTabs ? (mode === 'demo' ? 8 : topInset) : topInset;
  const scrollBottom = inTabs ? bottomTabClearance(insets.bottom) : 40;
  return <View style={[styles.page, { paddingTop: pageTop, paddingBottom: inTabs ? 0 : systemBottomInset(insets.bottom), paddingLeft: insets.left, paddingRight: insets.right }]}><ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingHorizontal: width < 360 ? 16 : width > 900 ? 36 : 20, paddingTop: inTabs ? 4 : 0, paddingBottom: scrollBottom }, compact && { gap: 12, paddingTop: 16 }]}>
    <View style={[styles.row, { minHeight: 52, alignItems: 'center' }]}><Brand />{inTabs ? <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => router.push('/profile')} style={{ minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.soft, borderRadius: 24 }}><Avatar name={profile.displayName} uri={profile.avatarUrl} /></Pressable> : <Icon name="shield" color={colors.primary} />}</View>
    <View style={styles.row}><View style={{ gap: 4, flex: 1 }}><Text accessibilityRole="header" style={styles.title}>{title}</Text>{subtitle && <Text style={styles.muted}>{subtitle}</Text>}</View>{action}</View>{children}
  </ScrollView></View>;
}
export function Button({ title, onPress, disabled, secondary, icon, label, danger, expanded }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; icon?: IconName; label?: string; danger?: boolean; expanded?: boolean }) {
  const [focused, setFocused] = useState(false);
  const feedback = usePressFeedback();
  const [pressed, setPressed] = useState(false), [hovered, setHovered] = useState(false);
  return <AnimatedPressable accessibilityRole="button" accessibilityLabel={title} aria-expanded={expanded} accessibilityState={{ disabled: !!disabled, ...(expanded !== undefined && { expanded }) }} disabled={disabled} onPress={onPress} onPressIn={event => { setPressed(true); feedback.onPressIn(event); }} onPressOut={() => { setPressed(false); feedback.onPressOut(); }} onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={[styles.button, feedback.style, secondary && { backgroundColor: colors.pale }, danger && { backgroundColor: colors.errorSurface }, focused && { outlineColor: colors.primary, outlineWidth: 2, outlineOffset: 3 }, !secondary && !danger && (pressed || hovered) && { backgroundColor: colors.dark }, secondary && (pressed || hovered) && { backgroundColor: colors.soft }, { opacity: disabled ? 0.5 : 1 }]}>{icon && <Icon name={icon} size={18} color={danger ? colors.negative : secondary ? colors.ink : colors.onPrimary} />}<Text style={[styles.buttonText, secondary && { color: colors.ink }, danger && { color: colors.negative }]}>{label ?? title}</Text></AnimatedPressable>;
}
export function GoogleButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel="Continuar com Google" disabled={disabled} aria-disabled={!!disabled} accessibilityState={{ disabled: !!disabled }} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => [styles.button, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#747775', opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }, focused && { outlineColor: colors.primary, outlineWidth: 2, outlineOffset: 3 }]}><Image source={require('../../assets/brand/google-g.png')} accessible={false} style={{ width: 20, height: 20 }} /><Text style={{ color: '#1F1F1F', fontSize: 14, fontWeight: '500' }}>Continuar com Google</Text></Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  return <View style={{ gap: 8 }}><Text style={[styles.text, { fontFamily: fonts.medium, fontSize: 13 }]}>{label}</Text><TextInput {...props} accessibilityLabel={label} onFocus={e => { setFocused(true); props.onFocus?.(e); }} onBlur={e => { setFocused(false); props.onBlur?.(e); }} placeholderTextColor={colors.muted} style={[styles.input, focused && { borderColor: colors.primary, backgroundColor: colors.surface }, props.style]} /></View>;
}
export function Choices<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return <View style={{ gap: 8 }}><Text style={[styles.text, { fontFamily: fonts.medium, fontSize: 13 }]}>{label}</Text><View accessibilityRole="radiogroup" accessibilityLabel={label} style={[styles.row, { justifyContent: 'flex-start', gap: 8 }]}>{options.map(option => <Pressable key={option.value} accessibilityRole="radio" aria-checked={value === option.value} accessibilityState={{ checked: value === option.value }} onPress={() => onChange(option.value)} style={[styles.chip, value === option.value && { backgroundColor: colors.primary, borderColor: colors.primary }]}><Text style={{ fontFamily: fonts.medium, fontSize: 13, color: value === option.value ? colors.onPrimary : colors.ink }}>{option.label}</Text></Pressable>)}</View></View>;
}
export function Box({ title, children }: { title?: string; children: React.ReactNode }) { return <View style={styles.box}>{title && <Text accessibilityRole="header" aria-level={2} style={styles.heading}>{title}</Text>}{children}</View>; }
export function Notice({ children, error }: { children: React.ReactNode; error?: boolean }) { return <View style={[styles.note, error && { backgroundColor: colors.errorSurface }]}><Icon name={error ? 'alert-circle' : 'info'} size={17} color={error ? colors.negative : colors.muted} /><Text accessibilityRole={error ? 'alert' : undefined} accessibilityLiveRegion="polite" style={[error ? styles.error : styles.muted, { flex: 1 }]}>{children}</Text></View>; }
export function Empty({ icon, title, detail, children }: { icon: IconName; title: string; detail: string; children?: React.ReactNode }) { return <View style={{ alignItems: 'center', paddingVertical: 24, gap: 12 }}><View style={{ width: 56, height: 56, backgroundColor: colors.pale, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={25} color={colors.muted} /></View><Text style={[styles.heading, { textAlign: 'center' }]}>{title}</Text><Text style={[styles.muted, { maxWidth: 320, textAlign: 'center' }]}>{detail}</Text>{children}</View>; }
export function MonthPicker({ month, previous, next, labelPrevious = 'Mês anterior', labelNext = 'Próximo mês' }: { month: string; previous: () => void; next: () => void; labelPrevious?: string; labelNext?: string }) {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`));
  const seen = useRef(month);
  const direction = month >= seen.current ? 1 : -1;
  useEffect(() => { seen.current = month; }, [month]);
  const labelStyle = [styles.text, { fontFamily: fonts.bold, fontSize: 13, textTransform: 'capitalize' as const, flexShrink: 1 }];
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 24, paddingHorizontal: 4 }}><Pressable accessibilityRole="button" accessibilityLabel={labelPrevious} onPress={previous} style={({ pressed }) => ({ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}><Icon name="chevron-left" /></Pressable><View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexShrink: 1 }}><Icon name="calendar" size={16} color={colors.muted} /><SlidingLabel month={month} direction={direction} style={labelStyle}>{label}</SlidingLabel></View><Pressable accessibilityRole="button" accessibilityLabel={labelNext} onPress={next} style={({ pressed }) => ({ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}><Icon name="chevron-right" /></Pressable></View>;
}
export function Loading() { return <View style={{ padding: 24 }}><ActivityIndicator accessibilityLabel="Carregando dados" color={colors.primary} /><Text style={styles.muted}>Carregando seus registros…</Text></View>; }
