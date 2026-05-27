import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import {
  getReviewTraitsForReviewee,
  type ReviewTraits,
} from '@/features/reviews/constants/review-traits';
import type { Review } from '@/features/reviews/types/review.types';

type ReviewSummaryCardProps = {
  review: Review;
  revieweeIsProfessional: boolean;
  showNavigateHint?: boolean;
};

function renderTraitPreview(traits: ReviewTraits, revieweeIsProfessional: boolean) {
  const definitions = getReviewTraitsForReviewee(revieweeIsProfessional);
  const preview = definitions
    .map((definition) => {
      const value = traits[definition.key];
      if (typeof value !== 'number') {
        return null;
      }

      return `${definition.label}: ${value}★`;
    })
    .filter((line): line is string => Boolean(line))
    .slice(0, 2);

  if (preview.length === 0) {
    return null;
  }

  return preview.map((line) => (
    <AppText key={line} color="textSecondary" numberOfLines={1} variant="caption">
      {line}
    </AppText>
  ));
}

export function ReviewSummaryCard({
  review,
  revieweeIsProfessional,
  showNavigateHint = false,
}: ReviewSummaryCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerMeta}>
          <AppText variant="bodyMedium">
            {review.rating.toFixed(1)}★ · {review.reviewerName}
          </AppText>
          {review.serviceRequestTitle ? (
            <AppText color="textSecondary" numberOfLines={1} variant="caption">
              {review.serviceRequestTitle}
            </AppText>
          ) : null}
        </View>
        {showNavigateHint ? (
          <AppText color="textMuted" variant="subtitle">
            ›
          </AppText>
        ) : null}
      </View>

      <View style={styles.traits}>{renderTraitPreview(review.traits, revieweeIsProfessional)}</View>

      {review.comment ? (
        <AppText color="textSecondary" numberOfLines={2} variant="caption">
          {review.comment}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  traits: {
    gap: 2,
  },
});
