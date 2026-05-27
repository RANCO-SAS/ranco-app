import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';
import { getCategoryIcon } from '@/features/jobs/utils/category-icons';
import { useTheme } from '@/hooks/use-theme';

const URGENCY_LABELS: Record<ServiceRequest['urgency'], string> = {
  low: 'Flexible',
  normal: 'Normal',
  high: 'Pronto',
  urgent: 'Urgente',
};

type JobOpportunityCardProps = {
  request: ServiceRequest;
  isContactLoading?: boolean;
  onPress?: () => void;
  onContactPress?: () => void;
  onDetailsPress?: () => void;
};

export function JobOpportunityCard({
  request,
  isContactLoading = false,
  onPress,
  onContactPress,
  onDetailsPress,
}: JobOpportunityCardProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Card
        style={[
          styles.card,
          {
            borderColor: theme.border,
            backgroundColor: theme.background,
          },
        ]}>
        <View style={styles.header}>
          <AppText style={styles.icon}>{getCategoryIcon('other')}</AppText>
          <View style={styles.headerText}>
            <AppText numberOfLines={1} variant="subtitle">
              {request.title}
            </AppText>
            <AppText color="textSecondary" numberOfLines={1} variant="caption">
              {request.categoryName} · {URGENCY_LABELS[request.urgency]}
            </AppText>
          </View>
        </View>

        {request.locationLabel ? (
          <AppText color="textMuted" numberOfLines={1} variant="small">
            {request.locationLabel}
          </AppText>
        ) : null}

        <View style={styles.actions}>
          <Button
            fullWidth={false}
            label="Ver detalle"
            onPress={onDetailsPress}
            size="md"
            variant="secondary"
          />
          <Button
            disabled={isContactLoading}
            fullWidth={false}
            label={isContactLoading ? 'Abriendo...' : 'Contactar'}
            onPress={onContactPress}
            size="md"
            variant="dark"
          />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 24,
    lineHeight: 28,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
