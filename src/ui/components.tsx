import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export const colors = { bg: '#F3F5F3', surface: '#FFFFFF', ink: '#142C34', muted: '#53656B', primary: '#12624C', soft: '#E3F0E9', border: '#D5DFDA', negative: '#B23E34' };
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg }, content: { width: '100%', maxWidth: 920, alignSelf: 'center', padding: 20, gap: 20, paddingBottom: 36 },
  title: { fontSize: 30, fontWeight: '700', color: colors.ink, letterSpacing: -0.8 }, heading: { fontSize: 20, fontWeight: '700', color: colors.ink },
  text: { fontSize: 15, lineHeight: 23, color: colors.ink }, muted: { fontSize: 14, lineHeight: 22, color: colors.muted },
  box: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, gap: 12, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  value: { fontSize: 28, fontWeight: '700', color: colors.ink, fontVariant: ['tabular-nums'] },
  button: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  input: { color: colors.ink, backgroundColor: '#FFFFFF', borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 14, minHeight: 48, fontSize: 16 },
  chip: { paddingHorizontal: 14, minHeight: 44, justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  note: { borderRadius: 10, padding: 12, backgroundColor: colors.soft }, error: { color: colors.negative, fontSize: 14, lineHeight: 22 },
});
export function Page({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <SafeAreaView style={styles.page} edges={['top', 'left', 'right']}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <View style={{ gap: 6 }}><Text accessibilityRole="header" style={styles.title}>{title}</Text>{subtitle && <Text style={styles.muted}>{subtitle}</Text>}</View>{children}
  </ScrollView></SafeAreaView>;
}
export function Button({ title, onPress, disabled, secondary }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && { backgroundColor: colors.soft }, { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 }]}><Text style={[styles.buttonText, secondary && { color: colors.primary }]}>{title}</Text></Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={{ gap: 8 }}><Text style={styles.text}>{label}</Text><TextInput {...props} accessibilityLabel={label} placeholderTextColor={colors.muted} style={[styles.input, props.style]} /></View>;
}
export function Choices<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return <View style={{ gap: 8 }}><Text style={styles.text}>{label}</Text><View style={[styles.row, { justifyContent: 'flex-start' }]}>{options.map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: value === option.value }} onPress={() => onChange(option.value)} style={[styles.chip, value === option.value && { backgroundColor: colors.soft, borderColor: colors.primary }]}><Text style={{ color: colors.ink }}>{option.label}</Text></Pressable>)}</View></View>;
}
export function Box({ title, children }: { title?: string; children: React.ReactNode }) { return <View style={styles.box}>{title && <Text accessibilityRole="header" style={styles.heading}>{title}</Text>}{children}</View>; }
export function Notice({ children, error }: { children: React.ReactNode; error?: boolean }) { return <View style={styles.note}><Text accessibilityRole={error ? 'alert' : undefined} accessibilityLiveRegion="polite" style={error ? styles.error : styles.muted}>{children}</Text></View>; }
export function Loading() { return <View style={{ padding: 24 }}><ActivityIndicator accessibilityLabel="Carregando dados" color={colors.primary} /><Text style={styles.muted}>Carregando seus registros…</Text></View>; }
