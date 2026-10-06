import { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { Easing, useReducedMotion } from 'react-native-reanimated';

export const motionTokens = {
  press: 90, release: 160, month: 220, reveal: 240, chart: 320, bar: 260,
  easing: Easing.bezier(0.22, 1, 0.36, 1),
};
const MotionContext = createContext({ disabled: false });

/** One subscription for the app; preferences can change while it stays open. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const initialReduced = useReducedMotion();
  const [reduced, setReduced] = useState(initialReduced === true);
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => setReduced(preference.matches);
      const key = (event: KeyboardEvent) => {
        if (['Tab', 'Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) setKeyboard(true);
      };
      const pointer = () => setKeyboard(false);
      update();
      preference.addEventListener('change', update);
      window.addEventListener('keydown', key, true);
      window.addEventListener('pointerdown', pointer, true);
      return () => {
        preference.removeEventListener('change', update);
        window.removeEventListener('keydown', key, true);
        window.removeEventListener('pointerdown', pointer, true);
      };
    }
    let live = true, changed = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      changed = true; setReduced(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (live && !changed) setReduced(value);
    }).catch(() => {});
    return () => { live = false; subscription.remove(); };
  }, []);
  return <MotionContext.Provider value={{ disabled: reduced || keyboard }}>{children}</MotionContext.Provider>;
}
export function useMotionSettings() { return useContext(MotionContext); }
