import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';

type ServiceRequestCardProps = {
  request: ServiceRequest;
  onPress?: () => void;
  footer?: ReactNode;
};

const URGENCY_LABELS: Record<ServiceRequest['urgency'], string> = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

const STATUS_LABELS: Record<ServiceRequest['status'], string> = {
  published: 'Publicada',
  in_negotiation: 'En negociación',
  accepted: 'Aceptada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export function ServiceRequestCard({ request, onPress, footer }: ServiceRequestCardProps) {
  const content = (
    <>
      <View style={styles.header}>
        <AppText variant="subtitle">{request.title}</AppText>
        <AppText variant="caption" color="primary">
          {request.categoryName} · {request.subcategoryName}
        </AppText>
      </View>
      <AppText variant="body" color="textSecondary" style={styles.description} numberOfLines={3}>
        {request.description}
      </AppText>
      <View style={styles.meta}>
        <AppText variant="small" color="textMuted">
          {STATUS_LABELS[request.status]} · Urgencia {URGENCY_LABELS[request.urgency]}
        </AppText>
        {request.locationLabel ? (
          <AppText variant="small" color="textMuted">
            {request.locationLabel}
          </AppText>
        ) : null}
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );

  if (!onPress) {
    return <Card>{content}</Card>;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Card>{content}</Card>
    </Pressable>
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
  footer: {
    marginTop: Spacing.md,
  },
});
