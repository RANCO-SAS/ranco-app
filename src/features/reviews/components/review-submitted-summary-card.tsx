import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { CardGradients, Radius, Spacing } from '@/constants/theme';
import { ReviewDetailCard } from '@/features/reviews/components/review-detail-card';
import { ReviewEvidenceUploader } from '@/features/reviews/components/review-evidence-uploader';
import type { Review } from '@/features/reviews/types/review.types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type ReviewSubmittedSummaryCardProps = {
  review: Review;
  revieweeIsProfessional: boolean;
  reviewerId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onViewDetail: () => void;
};

export function ReviewSubmittedSummaryCard({
  review,
  revieweeIsProfessional,
  reviewerId,
  isExpanded,
  onToggleExpand,
  onViewDetail,
}: ReviewSubmittedSummaryCardProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const gradients = CardGradients[scheme];

  return (
    <View
      style={[
        styles.outer,
        {
          borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : theme.border,
        },
      ]}>
      <LinearGradient
        colors={[...gradients.surface]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.gradient}>
        <LinearGradient
          colors={[...gradients.glow]}
          end={{ x: 1, y: 0.85 }}
          pointerEvents="none"
          start={{ x: 0, y: 0 }}
          style={styles.glow}
        />

        <View style={styles.content}>
          <Pressable
            accessibilityRole="button"
            onPress={onToggleExpand}
            style={styles.header}>
            <View style={styles.headerMeta}>
              <View style={styles.titleRow}>
                <AppText variant="bodyMedium">Tu reseña</AppText>
                <View style={styles.ratingRow}>
                  <AppText variant="bodyMedium">{review.rating.toFixed(1)}</AppText>
                  <AppIcon color={theme.warning} name="star" size={14} />
                </View>
              </View>

              {!isExpanded && review.comment ? (
                <AppText color="textSecondary" numberOfLines={1} variant="caption">
                  {review.comment}
                </AppText>
              ) : null}
            </View>

            <AppIcon
              color={theme.textMuted}
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
            />
          </Pressable>

          {isExpanded ? (
            <>
              <Spacer size="md" />
              <ReviewDetailCard
                review={review}
                revieweeIsProfessional={revieweeIsProfessional}
                showReviewerLink={false}
              />
              <ReviewEvidenceUploader
                initialUrls={review.evidenceUrls}
                reviewId={review.id}
                reviewerId={reviewerId}
              />
            </>
          ) : (
            <Pressable accessibilityRole="button" onPress={onViewDetail} style={styles.detailLink}>
              <AppText color="primary" variant="caption">
                Ver detalle completo ›
              </AppText>
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: Radius.xl,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radius.xl,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headerMeta: {
    flex: 1,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLink: {
    marginTop: Spacing.sm,
  },
});
