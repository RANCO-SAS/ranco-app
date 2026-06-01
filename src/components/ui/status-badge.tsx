import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';
import { SERVICE_REQUEST_STATUS_LABELS } from '@/features/jobs/constants/service-request-labels';

type StatusBadgeVariant = 'neutral' | 'info' | 'success' | 'warning';

type StatusBadgeProps = {
  status: ServiceRequestStatus;
  label?: string;
};

const STATUS_VARIANTS: Record<ServiceRequestStatus, StatusBadgeVariant> = {
  published: 'neutral',
  in_negotiation: 'info',
  accepted: 'success',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'warning',
};

const VARIANT_COLORS: Record<
  StatusBadgeVariant,
  { background: string; text: string }
> = {
  neutral: { background: 'rgba(142, 142, 147, 0.18)', text: '#AEAEB2' },
  info: { background: 'rgba(10, 132, 255, 0.18)', text: '#0A84FF' },
  success: { background: 'rgba(48, 209, 88, 0.18)', text: '#30D158' },
  warning: { background: 'rgba(255, 159, 10, 0.18)', text: '#FF9F0A' },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const variant = STATUS_VARIANTS[status];
  const colors = VARIANT_COLORS[variant];
  const text = label ?? SERVICE_REQUEST_STATUS_LABELS[status];

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <AppText style={[styles.label, { color: colors.text }]} variant="small">
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  label: {
    fontWeight: '600',
  },
});
