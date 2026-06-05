import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { CLIENT_SERVICE_FEE_PERCENT_LABEL } from '@/features/payments/constants/platform-fee';
import { calculatePaymentBreakdown } from '@/features/payments/utils/calculate-payment-breakdown';
import { formatOfferAmount } from '@/features/offers/utils/format-offer-amount';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type ClientServiceTotalPreviewProps = {
  amountCents: number;
  currency?: 'COP';
  variant?: 'compact' | 'detailed';
};

export function ClientServiceTotalPreview({
  amountCents,
  currency = 'COP',
  variant = 'detailed',
}: ClientServiceTotalPreviewProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const breakdown = calculatePaymentBreakdown(amountCents);
  const agreedLabel = formatOfferAmount(breakdown.agreedAmountCents, currency);
  const feeLabel = formatOfferAmount(breakdown.clientFeeCents, currency);
  const totalLabel = formatOfferAmount(breakdown.clientTotalCents, currency);
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : theme.border;

  if (variant === 'compact') {
    return (
      <AppText color="textSecondary" variant="caption">
        Total a pagar:{' '}
        <AppText style={{ color: theme.primary, fontWeight: '600' }} variant="caption">
          {totalLabel}
        </AppText>{' '}
        ({agreedLabel} + {CLIENT_SERVICE_FEE_PERCENT_LABEL} Ranco)
      </AppText>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor }]}>
      <AppText color="textMuted" style={styles.label} variant="small">
        TU COSTO REAL COMO CLIENTE
      </AppText>

      <View style={styles.row}>
        <AppText color="textSecondary" variant="caption">
          Precio pactado
        </AppText>
        <AppText variant="bodyMedium">{agreedLabel}</AppText>
      </View>

      <View style={styles.row}>
        <AppText color="textSecondary" variant="caption">
          Tarifa Ranco ({CLIENT_SERVICE_FEE_PERCENT_LABEL})
        </AppText>
        <AppText color="textMuted" variant="caption">
          +{feeLabel}
        </AppText>
      </View>

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      <View style={styles.row}>
        <AppText variant="bodyMedium">Total a pagar</AppText>
        <AppText style={{ color: theme.primary }} variant="subtitle">
          {totalLabel}
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
});

export function formatClientServiceTotalLabel(amountCents: number, currency: 'COP' = 'COP'): string {
  const { clientTotalCents } = calculatePaymentBreakdown(amountCents);
  return formatOfferAmount(clientTotalCents, currency);
}
