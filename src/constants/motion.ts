import { Easing } from 'react-native-reanimated';

export const Motion = {
  staggerStepMs: 60,
  entranceDurationMs: 320,
  pressDurationMs: 120,
  pressScale: 0.98,
  entranceEasing: Easing.out(Easing.cubic),
  pressEasing: Easing.out(Easing.quad),
} as const;

export function staggerDelay(index: number): number {
  return index * Motion.staggerStepMs;
}
