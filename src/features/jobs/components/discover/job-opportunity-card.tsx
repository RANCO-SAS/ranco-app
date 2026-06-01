import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { ServiceRequestAuthorHeader } from '@/features/jobs/components/service-request-author-header';
import { ServiceRequestPhotoGallery } from '@/features/jobs/components/service-request-photo-gallery';
import { UrgencyBadge } from '@/features/jobs/components/urgency-badge';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';
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
  const headline = request.title.trim() || request.subcategoryName;
  const description = request.description.trim();
  const showDescription = description.length > 0 && description !== headline;

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
        categoryLabel={request.categoryName}
        client={request.client}
        createdAt={request.createdAt}
        trailing={<UrgencyBadge uppercase urgency={request.urgency} />}
      />

      <AppText numberOfLines={2} variant="subtitle">
        {headline}
      </AppText>

      {showDescription ? (
        <AppText color="textSecondary" numberOfLines={3} variant="body">
          {description}
        </AppText>
      ) : null}

      {request.locationLabel ? (
        <View style={styles.locationRow}>
          <AppIcon color={theme.primary} name="location-outline" size={16} />
          <AppText color="primary" numberOfLines={1} style={styles.locationText} variant="caption">
            {request.locationLabel}
          </AppText>
        </View>
      ) : null}

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
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
});
