import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { ReviewStarRating } from '@/features/reviews/components/review-star-rating';
import { ReviewTraitScoreCompactRow } from '@/features/reviews/components/review-trait-score-compact-row';
import {
  getReviewTraitsForReviewee,
  type ReviewTraits,
} from '@/features/reviews/constants/review-traits';
import type { Review } from '@/features/reviews/types/review.types';
import { formatReviewRelativeTime } from '@/features/reviews/utils/format-review-time';
import { useTheme } from '@/hooks/use-theme';

type ReviewSummaryCardProps = {
  review: Review;
  revieweeIsProfessional: boolean;
};

const TRAIT_PREVIEW_COUNT = 2;

function renderTraitPreview(traits: ReviewTraits, revieweeIsProfessional: boolean) {
  const definitions = getReviewTraitsForReviewee(revieweeIsProfessional);

  return definitions
    .map((definition) => {
      const value = traits[definition.key];

      if (typeof value !== 'number') {
        return null;
      }

      return (
        <ReviewTraitScoreCompactRow definition={definition} key={definition.key} value={value} />
      );
    })
    .filter(Boolean)
    .slice(0, TRAIT_PREVIEW_COUNT);
}

export function ReviewSummaryCard({ review, revieweeIsProfessional }: ReviewSummaryCardProps) {
  const theme = useTheme();
  const traitPreview = renderTraitPreview(review.traits, revieweeIsProfessional);
  const relativeTime = formatReviewRelativeTime(review.createdAt);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar imageUrl={review.reviewerAvatarUrl} name={review.reviewerName} size={44} />

        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={styles.nameRow}>
              <AppText numberOfLines={1} style={styles.name} variant="bodyMedium">
                {review.reviewerName}
              </AppText>
              <View style={[styles.verifiedBadge, { backgroundColor: theme.primary }]}>
                <AppIcon color={theme.primaryForeground} name="checkmark" size={10} />
              </View>
            </View>

            {relativeTime ? (
              <AppText color="textMuted" style={styles.time} variant="caption">
                {relativeTime}
              </AppText>
            ) : null}
          </View>

          <ReviewStarRating rating={review.rating} />
        </View>
      </View>

      {review.comment ? (
        <AppText color="textSecondary" numberOfLines={3} style={styles.comment} variant="body">
          &ldquo;{review.comment}&rdquo;
        </AppText>
      ) : null}

      {traitPreview.length > 0 ? <View style={styles.traits}>{traitPreview}</View> : null}

      <View style={styles.footer}>
        <AppIcon color={theme.primary} name="checkmark-circle" size={14} />
        <AppText color="primary" style={styles.footerLabel} variant="caption">
          Servicio verificado
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headerContent: {
    flex: 1,
    gap: Spacing.xs,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: 0,
  },
  name: {
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  time: {
    flexShrink: 0,
  },
  comment: {
    lineHeight: 22,
  },
  traits: {
    gap: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerLabel: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
