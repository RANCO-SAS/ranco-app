import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    background: '#F1F5F9',
    backgroundSecondary: '#FFFFFF',
    backgroundElement: '#E2E8F0',
    border: '#CBD5E1',
    primary: '#2563EB',
    primaryForeground: '#FFFFFF',
    destructive: '#DC2626',
    success: '#16A34A',
    warning: '#D97706',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textMuted: '#8E8E93',
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    backgroundElement: '#2C2C2E',
    border: '#38383A',
    primary: '#0A84FF',
    primaryForeground: '#FFFFFF',
    destructive: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
  },
} as const;

export const BrandGradients = {
  light: ['#2563EB', '#4F46E5', '#7C3AED'] as const,
  dark: ['#0A84FF', '#5E5CE6', '#BF5AF2'] as const,
} as const;

export const ButtonGradients = {
  light: ['#2563EB', '#2B6AE8', '#3270E3'] as const,
  dark: ['#0A84FF', '#158AF6', '#1E90ED'] as const,
} as const;

export const CardGradients = {
  light: {
    surface: ['#FFFFFF', '#F4F7FF', '#E6EEFF'] as const,
    glow: ['rgba(37, 99, 235, 0.11)', 'rgba(37, 99, 235, 0.04)', 'transparent'] as const,
  },
  dark: {
    surface: ['#303036', '#1C1C1E', '#111113'] as const,
    glow: ['rgba(10, 132, 255, 0.18)', 'rgba(10, 132, 255, 0.06)', 'transparent'] as const,
  },
} as const;

export const NegotiationSheetGradients = {
  light: {
    sheet: ['#F2F2F7', '#FFFFFF'] as const,
    pendingBadge: ['#6366F1', '#818CF8'] as const,
    amount: '#2563EB',
  },
  dark: {
    sheet: ['#1C1C1E', '#141416'] as const,
    pendingBadge: ['#6366F1', '#818CF8'] as const,
    amount: '#64D2FF',
  },
} as const;

/** Subtle full-screen backgrounds for legal / static content screens */
export const TermsScreenGradients = {
  light: ['#FFFFFF', '#F8FAFC', '#F1F5F9'] as const,
  dark: ['#1C1C1E', '#0A0A0A', '#000000'] as const,
} as const;

export const NegotiationButtonGradients = {
  light: {
    primary: ['#1E40AF', '#2563EB', '#3B82F6'] as const,
    primaryText: '#FFFFFF',
    primaryIcon: '#FFFFFF',
  },
  dark: {
    primary: ['#1E3A8A', '#1D4ED8', '#2563EB'] as const,
    primaryText: '#FFFFFF',
    primaryIcon: '#FFFFFF',
  },
} as const;

export const NegotiationButtonSurfaces = {
  light: {
    outline: {
      background: '#FFFFFF',
      border: '#CBD5E1',
      text: '#0F172A',
    },
    mutedDestructive: {
      background: '#FEF2F2',
      border: '#FECACA',
      text: '#DC2626',
    },
  },
  dark: {
    outline: {
      background: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.12)',
      text: '#FFFFFF',
    },
    mutedDestructive: {
      background: 'rgba(72, 32, 32, 0.55)',
      border: 'rgba(127, 29, 29, 0.45)',
      text: '#FCA5A5',
    },
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ColorScheme = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const Typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
  subtitle: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const;

export const Layout = {
  screenPaddingHorizontal: Spacing.lg,
  screenPaddingVertical: Spacing.lg,
  maxContentWidth: 480,
  minTouchTarget: 44,
} as const;
