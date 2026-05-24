import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';

type ServiceRequestCardProps = {
  request: ServiceRequest;
};

const URGENCY_LABELS: Record<ServiceRequest['urgency'], string> = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

export function ServiceRequestCard({ request }: ServiceRequestCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="subtitle">{request.title}</AppText>
        <AppText variant="caption" color="primary">
          {request.category}
        </AppText>
      </View>
      <AppText variant="body" color="textSecondary" style={styles.description}>
        {request.description}
      </AppText>
      <View style={styles.meta}>
        <AppText variant="small" color="textMuted">
          Urgencia: {URGENCY_LABELS[request.urgency]}
        </AppText>
        {request.locationLabel ? (
          <AppText variant="small" color="textMuted">
            {request.locationLabel}
          </AppText>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Spacing.sm,
  },
  meta: {
    gap: Spacing.xs,
  },
});
