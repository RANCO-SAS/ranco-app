import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { SERVICE_REQUEST_URGENCY_LABELS } from '@/features/jobs/constants/service-request-labels';
import type { ServiceRequestUrgency } from '@/features/jobs/types/service-request.types';
import { getBadgeToneColors } from '@/shared/utils/badge-colors';
import { useTheme } from '@/hooks/use-theme';

type UrgencyBadgeProps = {
  urgency: ServiceRequestUrgency;
  uppercase?: boolean;
};

function getUrgencyTone(urgency: ServiceRequestUrgency): 'neutral' | 'info' | 'warning' {
  if (urgency === 'high') {
    return 'info';
  }

  if (urgency === 'urgent') {
    return 'warning';
  }

  return 'neutral';
}

export function UrgencyBadge({ urgency, uppercase = false }: UrgencyBadgeProps) {
  const theme = useTheme();
  const colors = getBadgeToneColors(theme, getUrgencyTone(urgency));
  const label = SERVICE_REQUEST_URGENCY_LABELS[urgency];

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <AppText style={[styles.label, { color: colors.text }]} variant="small">
        {uppercase ? label.toUpperCase() : label}
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
