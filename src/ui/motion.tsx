import { useEffect, useRef } from 'react';
import { GestureResponderEvent, StyleProp, TextStyle, View } from 'react-native';
import Animated, { cancelAnimation, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { motionTokens, useMotionSettings } from './motionPreferences';

const arrive = motionTokens.easing;
const shift = 12;

function useLedger(month: string, direction: number) {
  const { disabled: reduced } = useMotionSettings();
  const previous = useRef(month);
  const x = useSharedValue(0);
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (reduced || previous.current === month) {
      cancelAnimation(x); cancelAnimation(opacity);
      x.value = 0;
      opacity.value = 1;
      previous.current = month;
      return;
    }
    previous.current = month;
    x.value = direction * shift;
    opacity.value = 0.85;
    x.value = withTiming(0, { duration: motionTokens.month, easing: arrive, reduceMotion: ReduceMotion.Never });
    opacity.value = withTiming(1, { duration: motionTokens.month, easing: arrive, reduceMotion: ReduceMotion.Never });
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
  return <View style={{ gap: 24 }}>{children}</View>;
}

export function ShareBar({ ratio, color, track = '#E7F2FC' }: { ratio: number; color: string; track?: string }) {
  const { disabled: reduced } = useMotionSettings();
  const target = Math.max(0, Math.min(1, ratio));
  const scale = useSharedValue(target);
  useEffect(() => {
    if (reduced) { cancelAnimation(scale); scale.value = target; }
    else scale.value = withTiming(target, { duration: motionTokens.bar, easing: arrive, reduceMotion: ReduceMotion.Never });
  }, [target, reduced, scale]);
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: scale.value }] }));
  return <View style={{ height: 5, borderRadius: 3, backgroundColor: track, overflow: 'hidden' }}><Animated.View style={[{ height: 5, width: '100%', borderRadius: 3, backgroundColor: color, transformOrigin: 'left center' }, fill]} /></View>;
}

export function usePressFeedback() {
  const { disabled } = useMotionSettings();
  const scale = useSharedValue(1);
  useEffect(() => { if (disabled) { cancelAnimation(scale); scale.value = 1; } }, [disabled, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return {
    style,
    onPressIn: (event: GestureResponderEvent) => {
      const type = (event.nativeEvent as unknown as { type?: string }).type;
      if (!disabled && !type?.startsWith('key')) scale.value = withTiming(0.98, { duration: motionTokens.press, easing: arrive, reduceMotion: ReduceMotion.Never });
    },
    onPressOut: () => {
      if (disabled) { cancelAnimation(scale); scale.value = 1; }
      else scale.value = withTiming(1, { duration: motionTokens.release, easing: arrive, reduceMotion: ReduceMotion.Never });
    },
  };
}

/** Short entrance only for content the user explicitly reveals. */
export function Reveal({ children }: { children: React.ReactNode }) {
  const { disabled } = useMotionSettings();
  const progress = useSharedValue(disabled ? 1 : 0);
  useEffect(() => {
    if (disabled) { cancelAnimation(progress); progress.value = 1; }
    else progress.value = withTiming(1, { duration: motionTokens.reveal, easing: arrive, reduceMotion: ReduceMotion.Never });
  }, [disabled, progress]);
  const style = useAnimatedStyle(() => ({ opacity: 0.85 + progress.value * 0.15, transform: [{ translateY: (1 - progress.value) * 6 }] }));
  return <Animated.View style={[{ gap: 16 }, style]}>{children}</Animated.View>;
}
