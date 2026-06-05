import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type ChatJobStatusBannerProps = {
  status: ServiceRequestStatus;
  message?: string | null;
  onPress?: () => void;
  pressable?: boolean;
};

type BannerTone = 'negotiation' | 'accepted' | 'progress' | 'completed' | 'cancelled';

type BannerPalette = {
  background: readonly [string, string];
  borderColor: string;
  accentColor: string;
  iconBackgroundColor: string;
};

type BannerContent = {
  tone: BannerTone;
  title: string;
  icon: AppIconName;
  fallbackMessage: string;
};

const BANNER_STATUSES = new Set<ServiceRequestStatus>([
  'in_negotiation',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
]);

function resolveBannerContent(status: ServiceRequestStatus): BannerContent | null {
  switch (status) {
    case 'in_negotiation':
      return {
        tone: 'negotiation',
        title: 'En negociación',
        icon: 'chatbubbles-outline',
        fallbackMessage: 'Coordinando detalles del servicio.',
      };
    case 'accepted':
      return {
        tone: 'accepted',
        title: 'Trabajo aceptado',
        icon: 'checkmark-circle-outline',
        fallbackMessage: 'Listo para iniciar cuando ambos estén de acuerdo.',
      };
    case 'in_progress':
      return {
        tone: 'progress',
        title: 'Trabajo en progreso',
        icon: 'construct-outline',
        fallbackMessage: 'El servicio está en curso.',
      };
    case 'completed':
      return {
        tone: 'completed',
        title: 'Trabajo completado',
        icon: 'checkmark-circle',
        fallbackMessage: 'Este trabajo finalizó correctamente.',
      };
    case 'cancelled':
      return {
        tone: 'cancelled',
        title: 'Trabajo cancelado',
        icon: 'close-circle-outline',
        fallbackMessage: 'Esta solicitud fue cancelada.',
      };
    default:
      return null;
  }
}

function getBannerPalette(
  tone: BannerTone,
  theme: ReturnType<typeof useTheme>,
  scheme: 'light' | 'dark',
): BannerPalette {
  if (tone === 'completed') {
    return scheme === 'dark'
      ? {
          background: ['rgba(48, 209, 88, 0.18)', 'rgba(48, 209, 88, 0.08)'],
          borderColor: 'rgba(48, 209, 88, 0.34)',
          accentColor: theme.success,
          iconBackgroundColor: 'rgba(48, 209, 88, 0.24)',
        }
      : {
          background: ['rgba(22, 163, 74, 0.14)', 'rgba(22, 163, 74, 0.06)'],
          borderColor: 'rgba(22, 163, 74, 0.28)',
          accentColor: theme.success,
          iconBackgroundColor: 'rgba(22, 163, 74, 0.16)',
        };
  }

  if (tone === 'negotiation') {
    return scheme === 'dark'
      ? {
          background: ['rgba(255, 159, 10, 0.18)', 'rgba(255, 159, 10, 0.08)'],
          borderColor: 'rgba(255, 159, 10, 0.34)',
          accentColor: theme.warning,
          iconBackgroundColor: 'rgba(255, 159, 10, 0.24)',
        }
      : {
          background: ['rgba(217, 119, 6, 0.14)', 'rgba(217, 119, 6, 0.06)'],
          borderColor: 'rgba(217, 119, 6, 0.28)',
          accentColor: theme.warning,
          iconBackgroundColor: 'rgba(217, 119, 6, 0.16)',
        };
  }

  if (tone === 'cancelled') {
    return scheme === 'dark'
      ? {
          background: ['rgba(255, 69, 58, 0.16)', 'rgba(255, 69, 58, 0.07)'],
          borderColor: 'rgba(255, 69, 58, 0.28)',
          accentColor: theme.destructive,
          iconBackgroundColor: 'rgba(255, 69, 58, 0.22)',
        }
      : {
          background: ['rgba(220, 38, 38, 0.12)', 'rgba(220, 38, 38, 0.05)'],
          borderColor: 'rgba(220, 38, 38, 0.24)',
          accentColor: theme.destructive,
          iconBackgroundColor: 'rgba(220, 38, 38, 0.14)',
        };
  }

  if (tone === 'progress') {
    return scheme === 'dark'
      ? {
          background: ['rgba(94, 92, 230, 0.2)', 'rgba(94, 92, 230, 0.08)'],
          borderColor: 'rgba(94, 92, 230, 0.34)',
          accentColor: '#5E5CE6',
          iconBackgroundColor: 'rgba(94, 92, 230, 0.24)',
        }
      : {
          background: ['rgba(79, 70, 229, 0.14)', 'rgba(79, 70, 229, 0.06)'],
          borderColor: 'rgba(79, 70, 229, 0.28)',
          accentColor: '#4F46E5',
          iconBackgroundColor: 'rgba(79, 70, 229, 0.16)',
        };
  }

  return scheme === 'dark'
    ? {
        background: ['rgba(10, 132, 255, 0.18)', 'rgba(10, 132, 255, 0.08)'],
        borderColor: 'rgba(10, 132, 255, 0.34)',
        accentColor: theme.primary,
        iconBackgroundColor: 'rgba(10, 132, 255, 0.24)',
      }
    : {
        background: ['rgba(37, 99, 235, 0.14)', 'rgba(37, 99, 235, 0.06)'],
        borderColor: 'rgba(37, 99, 235, 0.28)',
        accentColor: theme.primary,
        iconBackgroundColor: 'rgba(37, 99, 235, 0.16)',
      };
}

export function ChatJobStatusBanner({
  status,
  message,
  onPress,
  pressable = false,
}: ChatJobStatusBannerProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  if (!BANNER_STATUSES.has(status)) {
    return null;
  }

  const content = resolveBannerContent(status);

  if (!content) {
    return null;
  }

  const palette = getBannerPalette(content.tone, theme, scheme);
  const trimmedMessage = message?.trim();
  const subtitle =
    trimmedMessage ??
    (content.tone === 'completed' ? null : content.fallbackMessage);
  const isInteractive = pressable && Boolean(onPress);

  const bannerBody = (
    <View style={[styles.container, { borderColor: palette.borderColor }]}>
      <LinearGradient
        colors={[...palette.background]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.gradient}>
        <View style={[styles.iconWrap, { backgroundColor: palette.iconBackgroundColor }]}>
          <AppIcon color={palette.accentColor} name={content.icon} size={20} />
        </View>

        <View style={styles.copy}>
          <AppText style={{ color: palette.accentColor }} variant="bodyMedium">
            {content.title}
          </AppText>
          {subtitle ? (
            <AppText color="textSecondary" numberOfLines={2} variant="caption">
              {subtitle}
            </AppText>
          ) : null}
        </View>

        {isInteractive ? (
          <AppIcon color={palette.accentColor} name="chevron-forward" size={18} />
        ) : null}
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {isInteractive ? (
        <AnimatedPressable accessibilityRole="button" onPress={onPress}>
          {bannerBody}
        </AnimatedPressable>
      ) : (
        bannerBody
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  container: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
});
