import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { SERVICE_REQUEST_URGENCY_LABELS } from '@/features/jobs/constants/service-request-labels';
import type { ServiceRequestUrgency } from '@/features/jobs/types/service-request.types';

type UrgencyBadgeProps = {
  urgency: ServiceRequestUrgency;
};

const URGENCY_COLORS: Record<ServiceRequestUrgency, { background: string; text: string }> = {
  low: { background: '#2C2C2E', text: '#AEAEB2' },
  normal: { background: '#2C2C2E', text: '#AEAEB2' },
  high: { background: '#1B2A3D', text: '#0A84FF' },
  urgent: { background: '#3A2224', text: '#FF6961' },
};

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const colors = URGENCY_COLORS[urgency];

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <AppText style={[styles.label, { color: colors.text }]} variant="small">
        {SERVICE_REQUEST_URGENCY_LABELS[urgency]}
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
