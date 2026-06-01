import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';
import { SERVICE_REQUEST_STATUS_LABELS } from '@/features/jobs/constants/service-request-labels';
import { getBadgeToneColors, type BadgeTone } from '@/shared/utils/badge-colors';
import { useTheme } from '@/hooks/use-theme';

type StatusBadgeProps = {
  status: ServiceRequestStatus;
  label?: string;
};

const STATUS_VARIANTS: Record<ServiceRequestStatus, BadgeTone> = {
  published: 'neutral',
  in_negotiation: 'info',
  accepted: 'success',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'warning',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const theme = useTheme();
  const variant = STATUS_VARIANTS[status];
  const colors = getBadgeToneColors(theme, variant);
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
