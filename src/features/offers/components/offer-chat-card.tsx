import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { OfferMessagePayload, OfferStatus } from '@/features/offers/types/offer';
import { formatOfferAmount } from '@/features/offers/utils/format-offer-amount';
import { useTheme } from '@/hooks/use-theme';

type OfferChatCardProps = {
  payload: OfferMessagePayload;
  isOwn: boolean;
  timeLabel: string;
};

const STATUS_LABELS: Record<OfferStatus, string> = {
  pending: 'Oferta pendiente',
  accepted: 'Oferta aceptada',
  withdrawn: 'Oferta retirada',
  superseded: 'Oferta reemplazada',
};

export function OfferChatCard({ payload, isOwn, timeLabel }: OfferChatCardProps) {
  const theme = useTheme();
  const amountLabel = formatOfferAmount(payload.amountCents, payload.currency);
  const statusLabel = STATUS_LABELS[payload.status];

  return (
    <View style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: isOwn ? theme.primary : theme.backgroundSecondary,
            borderColor: isOwn ? theme.primary : theme.border,
          },
        ]}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: isOwn ? 'rgba(255,255,255,0.18)' : theme.backgroundElement },
            ]}>
            <AppIcon
              color={isOwn ? theme.primaryForeground : theme.warning}
              name="cash-outline"
              size={18}
            />
          </View>
          <AppText color={isOwn ? 'primaryForeground' : 'text'} variant="bodyMedium">
            {statusLabel}
          </AppText>
        </View>

        <AppText
          color={isOwn ? 'primaryForeground' : 'text'}
          style={styles.amount}
          variant="title">
          {amountLabel}
        </AppText>

        <AppText
          color={isOwn ? 'primaryForeground' : 'textMuted'}
          style={isOwn ? styles.metaOnPrimary : undefined}
          variant="small">
          {timeLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  wrapperOwn: {
    justifyContent: 'flex-end',
  },
  wrapperOther: {
    justifyContent: 'flex-start',
  },
  card: {
    maxWidth: '82%',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 22,
    lineHeight: 28,
  },
  metaOnPrimary: {
    opacity: 0.85,
  },
});
