import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { CardGradients, Radius, Spacing } from '@/constants/theme';
import { isTopFeaturedProfessional } from '@/features/home/hooks/use-featured-professionals';
import type { FeaturedProfessional } from '@/features/home/types/featured-professional.types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type FeaturedProfessionalCardProps = {
  professional: FeaturedProfessional;
  onPressProfile: () => void;
};

export function FeaturedProfessionalCard({
  professional,
  onPressProfile,
}: FeaturedProfessionalCardProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const gradients = CardGradients[scheme];
  const showTopBadge = isTopFeaturedProfessional(professional);
  const displayName = professional.fullName.trim() || 'Profesional';

  return (
    <View
      style={[
        styles.cardOuter,
        getCardElevation(scheme),
        {
          borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.1)' : theme.border,
        },
      ]}>
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
          <View style={styles.headerRow}>
            <View style={styles.profileRow}>
              <Avatar imageUrl={professional.avatarUrl} name={displayName} size={52} />
              <View style={styles.profileText}>
                <AppText numberOfLines={1} variant="bodyMedium">
                  {displayName}
                </AppText>
                <AppText color="textSecondary" numberOfLines={1} variant="caption">
                  {professional.subcategoryName}
                </AppText>
              </View>
            </View>

            {showTopBadge ? (
              <View style={[styles.topBadge, { backgroundColor: `${theme.primary}22` }]}>
                <AppText color="primary" variant="small">
                  Top
                </AppText>
              </View>
            ) : null}
          </View>

          <View style={styles.ratingRow}>
            <AppIcon color={theme.warning} name="star" size={16} />
            <AppText variant="bodyMedium">{professional.averageRating.toFixed(1)}</AppText>
            <AppText color="textMuted" variant="caption">
              ({professional.reviewCount} reseñas)
            </AppText>
          </View>

          <Button
            fullWidth
            label="Ver perfil"
            onPress={onPressProfile}
            size="md"
            variant="gradient"
          />
        </View>
      </LinearGradient>
    </View>
  );
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
    width: 260,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'relative',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  profileRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minWidth: 0,
  },
  profileText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  topBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
