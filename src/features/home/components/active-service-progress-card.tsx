import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CategoryIcon } from '@/components/ui/category-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { SERVICE_REQUEST_STATUS_LABELS } from '@/features/jobs/constants/service-request-labels';
import type { ServiceRequest, ServiceRequestStatus } from '@/features/jobs/types/service-request.types';
import { useTheme } from '@/hooks/use-theme';

type ActiveServiceProgressCardProps = {
  request: ServiceRequest;
  categorySlug: string;
  onPressDetails: () => void;
};

const ACTIVE_SERVICE_PROGRESS: Partial<Record<ServiceRequestStatus, number>> = {
  accepted: 0.4,
  in_progress: 0.75,
};

export function ActiveServiceProgressCard({
  request,
  categorySlug,
  onPressDetails,
}: ActiveServiceProgressCardProps) {
  const theme = useTheme();
  const progress = ACTIVE_SERVICE_PROGRESS[request.status] ?? 0.4;
  const headline = request.title.trim() || request.subcategoryName;
  const statusLabel = SERVICE_REQUEST_STATUS_LABELS[request.status];

  return (
    <View style={styles.section}>
      <AppText variant="bodyMedium">Servicio en curso</AppText>

      <Card>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${theme.primary}18` }]}>
              <CategoryIcon slug={categorySlug} size={22} />
            </View>

            <View style={styles.headerText}>
              <AppText numberOfLines={1} variant="bodyMedium">
                {headline}
              </AppText>
              <AppText color="textSecondary" variant="caption">
                {statusLabel}
              </AppText>
            </View>

            <View style={styles.statusPill}>
              <AppIcon color={theme.primary} name="time-outline" size={14} />
              <AppText color="primary" variant="small">
                Activo
              </AppText>
            </View>
          </View>

          <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: theme.primary,
                  width: `${Math.max(progress * 100, 8)}%`,
                },
              ]}
            />
          </View>

          <Button
            fullWidth
            label="Ver detalles"
            onPress={onPressDetails}
            size="md"
            variant="secondary"
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  content: {
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  track: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
