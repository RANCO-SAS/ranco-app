import type { ColorScheme, Colors } from '@/constants/theme';

type Theme = (typeof Colors)[ColorScheme];

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning';

export function getBadgeToneColors(
  theme: Theme,
  tone: BadgeTone,
): { background: string; text: string } {
  switch (tone) {
    case 'info':
      return {
        background: `${theme.primary}22`,
        text: theme.primary,
      };
    case 'success':
      return {
        background: `${theme.success}22`,
        text: theme.success,
      };
    case 'warning':
      return {
        background: `${theme.warning}22`,
        text: theme.warning,
      };
    default:
      return {
        background: theme.backgroundElement,
        text: theme.textSecondary,
      };
  }
}

export type { BadgeTone };
