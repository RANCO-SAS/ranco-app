import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { ServicePaymentStatus } from '@/features/payments/types/payment';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type PaymentStatusBannerProps = {
  paymentStatus: ServicePaymentStatus;
  isClient: boolean;
  onPress: () => void;
};

export function PaymentStatusBanner({ paymentStatus, isClient, onPress }: PaymentStatusBannerProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';

  if (paymentStatus === 'payout_completed') {
    return null;
  }

  const isAwaitingClient = paymentStatus === 'awaiting_client_payment';
  const isAwaitingWorker = paymentStatus === 'paid_pending_payout';

  if (isAwaitingClient && !isClient) {
    return null;
  }

  if (isAwaitingWorker && isClient) {
    return null;
  }

  const title = isAwaitingClient ? 'Pago pendiente' : 'Pago por reclamar';
  const message = isAwaitingClient
    ? 'Completa el pago del servicio finalizado.'
    : 'Tienes un pago disponible para retirar.';
  const icon = isAwaitingClient ? 'card-outline' : 'wallet-outline';
  const gradient: readonly [string, string] =
    colorScheme === 'dark'
      ? (['#1E3A8A', '#2563EB'] as const)
      : (['#DBEAFE', '#BFDBFE'] as const);
  const accentColor = colorScheme === 'dark' ? '#64D2FF' : theme.primary;

  return (
    <AnimatedPressable accessibilityRole="button" onPress={onPress} style={styles.wrapper}>
      <LinearGradient
        colors={[...gradient]}
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={[
          styles.banner,
          {
            borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : theme.border,
          },
        ]}>
        <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
          <AppIcon color={accentColor} name={icon} size={18} />
        </View>
        <View style={styles.copy}>
          <AppText style={{ color: colorScheme === 'dark' ? '#FFFFFF' : theme.text }} variant="bodyMedium">
            {title}
          </AppText>
          <AppText
            color={colorScheme === 'dark' ? undefined : 'textSecondary'}
            style={colorScheme === 'dark' ? { color: 'rgba(255,255,255,0.78)' } : undefined}
            variant="caption">
            {message}
          </AppText>
        </View>
        <AppIcon color={accentColor} name="chevron-forward" size={18} />
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: Spacing.sm,
  },
  banner: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
