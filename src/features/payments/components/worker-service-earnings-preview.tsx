import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { WORKER_SERVICE_FEE_PERCENT_LABEL } from '@/features/payments/constants/platform-fee';
import { calculatePaymentBreakdown } from '@/features/payments/utils/calculate-payment-breakdown';
import { formatOfferAmount } from '@/features/offers/utils/format-offer-amount';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type WorkerServiceEarningsPreviewProps = {
  amountCents: number;
  currency?: 'COP';
  variant?: 'compact' | 'detailed';
  inverted?: boolean;
};

export function WorkerServiceEarningsPreview({
  amountCents,
  currency = 'COP',
  variant = 'detailed',
  inverted = false,
}: WorkerServiceEarningsPreviewProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const breakdown = calculatePaymentBreakdown(amountCents);
  const agreedLabel = formatOfferAmount(breakdown.agreedAmountCents, currency);
  const feeLabel = formatOfferAmount(breakdown.workerFeeCents, currency);
  const netLabel = formatOfferAmount(breakdown.payoutCents, currency);
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : theme.border;
  const accentColor = inverted ? theme.primaryForeground : theme.primary;

  if (variant === 'compact') {
    return (
      <AppText color={inverted ? undefined : 'textSecondary'} style={inverted ? styles.compactInverted : undefined} variant="caption">
        Ganancia neta:{' '}
        <AppText style={{ color: accentColor, fontWeight: '600' }} variant="caption">
          {netLabel}
        </AppText>{' '}
        ({agreedLabel} − {WORKER_SERVICE_FEE_PERCENT_LABEL} Ranco)
      </AppText>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor }]}>
      <AppText color="textMuted" style={styles.label} variant="small">
        TU GANANCIA REAL COMO TRABAJADOR
      </AppText>

      <View style={styles.row}>
        <AppText color="textSecondary" variant="caption">
          Precio pactado
        </AppText>
        <AppText variant="bodyMedium">{agreedLabel}</AppText>
      </View>

      <View style={styles.row}>
        <AppText color="textSecondary" variant="caption">
          Comisión Ranco ({WORKER_SERVICE_FEE_PERCENT_LABEL})
        </AppText>
        <AppText color="textMuted" variant="caption">
          −{feeLabel}
        </AppText>
      </View>

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      <View style={styles.row}>
        <AppText variant="bodyMedium">Recibirás</AppText>
        <AppText style={{ color: theme.primary }} variant="subtitle">
          {netLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  label: {
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  compactInverted: {
    color: 'rgba(255, 255, 255, 0.88)',
  },
});

export function formatWorkerNetEarningsLabel(amountCents: number, currency: 'COP' = 'COP'): string {
  const { payoutCents } = calculatePaymentBreakdown(amountCents);
  return formatOfferAmount(payoutCents, currency);
}
