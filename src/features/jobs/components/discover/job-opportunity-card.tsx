import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { CardGradients, Radius, Spacing } from '@/constants/theme';
import { ServiceRequestAuthorHeader } from '@/features/jobs/components/service-request-author-header';
import { ServiceRequestPhotoGallery } from '@/features/jobs/components/service-request-photo-gallery';
import { UrgencyBadge } from '@/features/jobs/components/urgency-badge';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  const colorScheme = useColorScheme() ?? 'light';
  const gradients = CardGradients[colorScheme];
  const headline = request.title.trim() || request.subcategoryName;
  const description = request.description.trim();
  const showDescription = description.length > 0 && description !== headline;

  const cardContent = (
    <LinearGradient
      colors={[...gradients.surface]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.cardGradient}>
      <LinearGradient
        colors={[...gradients.glow]}
        end={{ x: 1, y: 0.8 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={styles.glowOverlay}
      />

      <View style={styles.content}>
        <ServiceRequestAuthorHeader
          categoryLabel={request.categoryName}
          client={request.client}
          createdAt={request.createdAt}
          trailing={<UrgencyBadge uppercase urgency={request.urgency} />}
        />

        <AppText numberOfLines={2} style={styles.headline} variant="subtitle">
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

        <View
          style={[
            styles.actions,
            {
              borderTopColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : theme.border,
            },
          ]}>
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
              variant="gradient"
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const cardShellStyle: ViewStyle[] = [
    styles.cardOuter,
    getCardElevation(colorScheme),
    {
      borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : theme.border,
    },
  ];

  if (onPress) {
    return (
      <AnimatedPressable accessibilityRole="button" onPress={onPress} style={cardShellStyle}>
        {cardContent}
      </AnimatedPressable>
    );
  }

  return <View style={cardShellStyle}>{cardContent}</View>;
}

function getCardElevation(colorScheme: 'light' | 'dark'): ViewStyle {
  const shadowColor = colorScheme === 'dark' ? '#0A84FF' : '#2563EB';

  return Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: colorScheme === 'dark' ? 0.15 : 0.1,
      shadowRadius: 14,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) ?? {};
}

const styles = StyleSheet.create({
  cardOuter: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'relative',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  headline: {
    letterSpacing: -0.2,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.xs,
    paddingTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
