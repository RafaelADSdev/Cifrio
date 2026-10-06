import { Text, View } from 'react-native';
import { Card, CardNetwork, CardTheme } from '../domain/model';
import { money } from '../domain/money';
import { Choices, colors, Field, fonts, Icon, styles } from './components';

export const networkOptions: { value: CardNetwork; label: string }[] = [
  { value: 'none', label: 'Não informada' }, { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' }, { value: 'elo', label: 'Elo' },
  { value: 'amex', label: 'American Express' }, { value: 'other', label: 'Outra' },
];
export const themeOptions: { value: CardTheme; label: string }[] = [
  { value: 'forest', label: 'Azul Cifrio' }, { value: 'carbon', label: 'Azul-marinho' },
  { value: 'ocean', label: 'Ciano' }, { value: 'plum', label: 'Azul profundo' },
];
const palettes = {
  forest: { bg: '#042453', muted: '#D5E4F5', border: '#5C8FBE', accent: '#23D2BF' },
  carbon: { bg: '#0D2F57', muted: '#D5E4F5', border: '#416F99', accent: '#86C8FF' },
  ocean: { bg: '#075880', muted: '#D5EFF8', border: '#478BAC', accent: '#23D2BF' },
  plum: { bg: '#0646A2', muted: '#D7E9FB', border: '#447DC0', accent: '#83CAFF' },
};

export function CardVisual({ card, remaining, compact = false }: { card: Card; remaining?: number; compact?: boolean }) {
  const palette = palettes[card.theme ?? 'forest'] ?? palettes.forest;
  const network = networkOptions.find(option => option.value === card.network)?.label;
  return <View testID={`card-visual-${card.id}`} style={{ backgroundColor: palette.bg, borderWidth: 1, borderColor: palette.border, borderRadius: 16, padding: compact ? 16 : 20, gap: compact ? 16 : 24, minHeight: compact ? 156 : 190, overflow: 'hidden' }}>
    <View pointerEvents="none" accessible={false} style={{ position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 24, borderColor: palette.border, opacity: 0.35, right: -60, top: -70 }} />
    <View pointerEvents="none" accessible={false} style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: palette.border, opacity: 0.2, right: -20, bottom: -80 }} />
    <View style={[styles.row, { flexWrap: 'nowrap', minHeight: 38 }]}>
      <Text style={{ fontFamily: fonts.bold, color: colors.onDark, fontSize: compact ? 14 : 17, flex: 1 }}>{card.name}</Text>
      {card.network === 'mastercard' ? <View accessibilityLabel="Mastercard" style={{ alignItems: 'center', gap: 3 }}><View style={{ flexDirection: 'row' }}><View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#EB001B' }} /><View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#F79E1B', marginLeft: -8 }} /></View><Text style={{ color: colors.onDark, fontFamily: fonts.medium, fontSize: 9 }}>Mastercard</Text></View> : <Text style={{ fontFamily: fonts.display, color: colors.onDark, fontSize: card.network === 'amex' ? 11 : 19, flexShrink: 1 }}>{card.network === 'visa' ? 'VISA' : card.network && card.network !== 'none' ? network : 'CRÉDITO'}</Text>}
    </View>
    <View style={styles.row}><Icon name="credit-card" color={palette.accent} size={28} /><Text style={{ color: colors.onDark, fontFamily: fonts.medium, fontSize: 17, letterSpacing: 1.5 }}>{card.lastFour ? `••••  ${card.lastFour}` : 'Final não informado'}</Text></View>
    <View style={[styles.row, { alignItems: 'flex-end' }]}><View style={{ gap: 3, flex: 1 }}><Text style={{ color: palette.muted, fontFamily: fonts.regular, fontSize: 11 }}>{remaining === undefined ? 'Limite cadastrado' : 'Fatura em aberto'}</Text><Text style={{ color: colors.onDark, fontFamily: fonts.bold, fontSize: compact ? 19 : 20, fontVariant: ['tabular-nums'] }}>{money(remaining ?? card.limit)}{!compact && remaining !== undefined ? ' em aberto' : ''}</Text></View><Text style={{ color: palette.muted, fontFamily: fonts.medium, fontSize: 11 }}>Vence dia {card.dueDay}</Text></View>
  </View>;
}

export function CardAppearanceFields({ network, theme, lastFour, onNetwork, onTheme, onLastFour }: {
  network: CardNetwork; theme: CardTheme; lastFour: string;
  onNetwork: (value: CardNetwork) => void; onTheme: (value: CardTheme) => void; onLastFour: (value: string) => void;
}) {
  return <View style={{ gap: 16 }}>
    <Choices label="Bandeira do cartão" value={network} options={networkOptions} onChange={onNetwork} />
    <Choices label="Tema do cartão" value={theme} options={themeOptions} onChange={onTheme} />
    <Field label="Últimos quatro dígitos (opcional)" value={lastFour} onChangeText={onLastFour} keyboardType="number-pad" maxLength={4} placeholder="1234" />
  </View>;
}
