import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { cancelAnimation, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { motionTokens, useMotionSettings } from './motionPreferences';
import { SpendingSlice } from '../domain/planning';
import { money } from '../domain/money';
import { colors, fonts, styles } from './components';

export const categoryColors: Record<string, string> = {
  Alimentação: '#0474E0', Moradia: '#042453', Transporte: '#23D2BF',
  Saúde: '#5C8FBE', Lazer: '#7B5CF0', Compras: '#E07A04', Salário: '#2E9B4C', Outros: '#8FA3BC',
};
function colorFor(category: string, index: number) {
  return categoryColors[category] ?? ['#0474E0', '#23D2BF', '#5C8FBE', '#042453', '#3E5674', '#B2403B'][index % 6];
}
function sector(start: number, sweep: number) {
  const point = (angle: number) => [110 + 102 * Math.cos(angle), 110 + 102 * Math.sin(angle)];
  const [x1, y1] = point(start), [x2, y2] = point(start + sweep);
  return 'M 110 110 L ' + x1 + ' ' + y1 + ' A 102 102 0 ' + (sweep > Math.PI ? 1 : 0) + ' 1 ' + x2 + ' ' + y2 + ' Z';
}
export function SpendingChart({ slices, total }: { slices: SpendingSlice[]; total: number }) {
  const { disabled: reduced } = useMotionSettings();
  const progress = useSharedValue(1);
  const signature = slices.map(slice => slice.category + ':' + slice.amount).join('|');
  const previous = useRef<string | null>(null);
  useEffect(() => {
    const next = signature + ':' + total;
    cancelAnimation(progress);
    if (reduced || previous.current === next) progress.value = 1;
    else {
      progress.value = 0;
      progress.value = withTiming(1, { duration: motionTokens.chart, easing: motionTokens.easing, reduceMotion: ReduceMotion.Never });
    }
    previous.current = next;
  }, [signature, total, reduced, progress]);
  const motion = useAnimatedStyle(() => ({
    opacity: 0.85 + progress.value * 0.15,
    transform: [{ scale: 0.97 + progress.value * 0.03 }],
  }));
  if (!slices.length || total <= 0) return null;
  const sum = slices.reduce((value, slice) => value + slice.amount, 0);
  let angle = -Math.PI / 2;
  return <View style={{ gap: 20 }}>
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Text style={styles.muted}>Gasto do mês</Text>
      <Text style={styles.value}>{money(total)}</Text>
    </View>
    <View accessibilityRole="image" accessibilityLabel="Gráfico de pizza de gastos por categoria. Valores e percentuais na legenda abaixo." style={{ alignItems: 'center' }}>
      <Animated.View testID="spending-chart-motion" style={[{ width: 220, height: 220 }, motion]}>
        <Svg width={220} height={220} viewBox="0 0 220 220">
          {slices.map((slice, index) => {
            const sweep = sum > 0 ? slice.amount / sum * Math.PI * 2 : 0;
            const start = angle;
            angle += sweep;
            if (sweep <= 0) return null;
            return sweep >= Math.PI * 2 - 0.000001
              ? <Circle key={slice.category} cx={110} cy={110} r={102} fill={colorFor(slice.category, index)} />
              : <Path key={slice.category} d={sector(start, sweep)} fill={colorFor(slice.category, index)} stroke={colors.surface} strokeWidth={2} strokeLinejoin="round" />;
          })}
        </Svg>
      </Animated.View>
    </View>
    <View style={{ gap: 12 }}>
      {slices.map((slice, index) => <View key={slice.category} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: index < slices.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colorFor(slice.category, index) }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.text, { fontSize: 13 }]}>{slice.category}</Text>
          <Text style={[styles.text, { fontFamily: fonts.bold, fontSize: 14, fontVariant: ['tabular-nums'] }]}>{money(slice.amount)}</Text>
        </View>
        <View style={{ backgroundColor: colors.pale, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 }}>
          <Text style={[styles.muted, { fontFamily: fonts.bold, fontVariant: ['tabular-nums'] }]}>{Math.round(slice.share * 100)}%</Text>
        </View>
      </View>)}
    </View>
  </View>;
}
