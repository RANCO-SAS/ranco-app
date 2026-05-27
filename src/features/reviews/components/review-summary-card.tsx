import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import {
  CLIENT_REVIEW_TRAITS,
  PROFESSIONAL_REVIEW_TRAITS,
  type ReviewTraits,
} from '@/features/reviews/constants/review-traits';
import type { Review } from '@/features/reviews/types/review.types';

type ReviewSummaryCardProps = {
  review: Review;
  revieweeIsProfessional: boolean;
};

function resolveTraitLabel(key: string, revieweeIsProfessional: boolean): string {
  const definitions = revieweeIsProfessional ? PROFESSIONAL_REVIEW_TRAITS : CLIENT_REVIEW_TRAITS;
  return definitions.find((definition) => definition.key === key)?.label ?? key;
}

function renderTraitLines(traits: ReviewTraits, revieweeIsProfessional: boolean) {
  const entries = Object.entries(traits).filter(
    (entry): entry is [string, number] => typeof entry[1] === 'number',
  );

  if (entries.length === 0) {
    return null;
  }

  return entries.map(([key, value]) => (
    <AppText key={key} color="textSecondary" variant="caption">
      {resolveTraitLabel(key, revieweeIsProfessional)}: {value}★
    </AppText>
  ));
}

export function ReviewSummaryCard({ review, revieweeIsProfessional }: ReviewSummaryCardProps) {
  return (
    <View style={styles.container}>
      <AppText variant="bodyMedium">
        {review.rating.toFixed(1)}★ · {review.reviewerName}
      </AppText>
      <View style={styles.traits}>{renderTraitLines(review.traits, revieweeIsProfessional)}</View>
      {review.comment ? (
        <AppText color="textSecondary" variant="caption">
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
  traits: {
    gap: 2,
  },
});
