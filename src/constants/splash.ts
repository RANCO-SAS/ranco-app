import { Colors } from '@/constants/theme';

export const SplashBackground = {
  light: Colors.light.background,
  dark: Colors.dark.background,
} as const;

export const SplashLottie = {
  speed: 1.5,
  totalFrames: 493,
  frameRate: 60,
} as const;

export function getSplashLottieDurationMs(
  config: typeof SplashLottie = SplashLottie,
): number {
  const rawDurationMs = (config.totalFrames / config.frameRate) * 1000;
  return Math.ceil(rawDurationMs / config.speed) + 500;
}
