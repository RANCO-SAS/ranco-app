import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/components/ui/category-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { ServiceRequestAuthorHeader } from '@/features/jobs/components/service-request-author-header';
import { ServiceRequestPhotoGallery } from '@/features/jobs/components/service-request-photo-gallery';
import { UrgencyBadge } from '@/features/jobs/components/urgency-badge';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';
import { resolveCategorySlug } from '@/features/jobs/utils/resolve-category-slug';
import { useTheme } from '@/hooks/use-theme';

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
  const categorySlug = resolveCategorySlug(request.categoryName);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}>
      <ServiceRequestAuthorHeader
        client={request.client}
        createdAt={request.createdAt}
        subtitle={request.categoryName}
        trailing={<UrgencyBadge urgency={request.urgency} />}
      />

      <View style={styles.titleRow}>
        <CategoryIcon slug={categorySlug} />
        <View style={styles.titleContent}>
          <AppText numberOfLines={2} variant="subtitle">
            {request.subcategoryName}
          </AppText>
          {request.locationLabel ? (
            <AppText color="textMuted" numberOfLines={1} variant="small">
              {request.locationLabel}
            </AppText>
          ) : null}
        </View>
      </View>

      <AppText color="textSecondary" numberOfLines={4} variant="body">
        {request.description}
      </AppText>

      {request.photoUrls.length > 0 ? (
        <ServiceRequestPhotoGallery photoUrls={request.photoUrls} />
      ) : null}

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <Button
            fullWidth
            label="Ver detalle"
            onPress={onDetailsPress}
            size="md"
            variant="secondary"
          />
        </View>
        <View style={styles.actionButton}>
          <Button
            disabled={isContactLoading}
            fullWidth
            label={isContactLoading ? 'Abriendo...' : 'Contactar'}
            onPress={onContactPress}
            size="md"
          />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    gap: Spacing.lg,
    padding: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  titleContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
