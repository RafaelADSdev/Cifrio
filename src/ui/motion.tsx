import { useEffect } from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

const arrive = Easing.bezier(0.16, 1, 0.3, 1);
const shift = 28;

function useLedger(month: string, direction: number) {
  const reduced = useReducedMotion() === true;
  const x = useSharedValue(0);
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (reduced) {
      x.value = 0;
      opacity.value = 0.72;
      opacity.value = withTiming(1, { duration: 160 });
      return;
    }
    x.value = direction * shift;
    opacity.value = 0.72;
    x.value = withTiming(0, { duration: 420, easing: arrive });
    opacity.value = withTiming(1, { duration: 280, easing: arrive });
  }, [month, direction, reduced, opacity, x]);
  return useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateX: x.value }] }));
}

export function Ledger({ month, direction, children }: { month: string; direction: number; children: React.ReactNode }) {
  const style = useLedger(month, direction);
  return <View style={{ overflow: 'hidden' }}><Animated.View style={style}>{children}</Animated.View></View>;
}

export function SlidingLabel({ month, direction, style, children }: { month: string; direction: number; style?: StyleProp<TextStyle>; children: string }) {
  const motion = useLedger(month, direction);
  return <View style={{ overflow: 'hidden', flexShrink: 1 }}><Animated.Text style={[style, motion]}>{children}</Animated.Text></View>;
}

export function Desk({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion() === true;
  const y = useSharedValue(reduced ? 0 : 10);
  const opacity = useSharedValue(reduced ? 1 : 0.8);
  useEffect(() => {
    y.value = withTiming(0, { duration: reduced ? 120 : 360, easing: arrive });
    opacity.value = withTiming(1, { duration: reduced ? 120 : 280, easing: arrive });
  }, [opacity, reduced, y]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }] }));
  return <Animated.View style={[{ gap: 24 }, style]}>{children}</Animated.View>;
}

export function ShareBar({ ratio, color, track = '#E3F0E7' }: { ratio: number; color: string; track?: string }) {
  const reduced = useReducedMotion() === true;
  const scale = useSharedValue(reduced ? ratio : 0);
  useEffect(() => { scale.value = withTiming(Math.max(0, Math.min(1, ratio)), { duration: reduced ? 120 : 460, easing: arrive }); }, [ratio, reduced, scale]);
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: scale.value }] }));
  return <View style={{ height: 5, borderRadius: 3, backgroundColor: track, overflow: 'hidden' }}><Animated.View style={[{ height: 5, width: '100%', borderRadius: 3, backgroundColor: color, transformOrigin: 'left center' }, fill]} /></View>;
}
