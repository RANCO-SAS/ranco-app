import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { ReviewEvidenceUploader } from '@/features/reviews/components/review-evidence-uploader';
import { ReviewSummaryCard } from '@/features/reviews/components/review-summary-card';
import { TraitRatingRow } from '@/features/reviews/components/trait-rating-row';
import {
  buildDefaultTraits,
  computeAverageRating,
  getReviewTraitsForReviewee,
  validateTraits,
  type ReviewTraits,
} from '@/features/reviews/constants/review-traits';
import { useCreateReview } from '@/features/reviews/hooks/use-reviews';
import type { Review } from '@/features/reviews/types/review.types';

type ReviewFormProps = {
  serviceRequestId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeName: string;
  revieweeIsProfessional: boolean;
  existingReview?: Review | null;
};

export function ReviewForm({
  serviceRequestId,
  reviewerId,
  revieweeId,
  revieweeName,
  revieweeIsProfessional,
  existingReview,
}: ReviewFormProps) {
  const createReview = useCreateReview();
  const traitDefinitions = useMemo(
    () => getReviewTraitsForReviewee(revieweeIsProfessional),
    [revieweeIsProfessional],
  );
  const [traits, setTraits] = useState<ReviewTraits>(
    existingReview?.traits ?? buildDefaultTraits(traitDefinitions),
  );
  const [comment, setComment] = useState('');
  const [submittedReview, setSubmittedReview] = useState<Review | null>(existingReview ?? null);

  const activeReview = submittedReview ?? existingReview ?? null;

  if (activeReview) {
    return (
      <Card>
        <AppText variant="bodyMedium">Tu reseña</AppText>
        <View style={styles.existingReview}>
          <ReviewSummaryCard review={activeReview} revieweeIsProfessional={revieweeIsProfessional} />
        </View>
        <ReviewEvidenceUploader
          initialUrls={activeReview.evidenceUrls}
          reviewId={activeReview.id}
          reviewerId={reviewerId}
        />
      </Card>
    );
  }

  const averageRating = computeAverageRating(traits);
  const canSubmit = validateTraits(traits, traitDefinitions);

  return (
    <Card>
      <AppText variant="bodyMedium">Valorar a {revieweeName}</AppText>
      <AppText color="textSecondary" variant="caption">
        Promedio: {averageRating.toFixed(1)}★
      </AppText>

      <View style={styles.traits}>
        {traitDefinitions.map((definition) => (
          <TraitRatingRow
            key={definition.key}
            definition={definition}
            disabled={createReview.isPending}
            onChange={(value) => {
              setTraits((current) => ({
                ...current,
                [definition.key]: value,
              }));
            }}
            value={traits[definition.key] ?? 5}
          />
        ))}
      </View>

      <Input
        editable={!createReview.isPending}
        label="Comentario (opcional)"
        multiline
        numberOfLines={3}
        onChangeText={setComment}
        placeholder="Cuéntanos cómo fue la experiencia"
        value={comment}
      />

      <Button
        disabled={createReview.isPending || !canSubmit}
        label={createReview.isPending ? 'Enviando reseña...' : 'Publicar reseña'}
        onPress={() => {
          if (!validateTraits(traits, traitDefinitions)) {
            return;
          }

          createReview.mutate(
            {
              serviceRequestId,
              reviewerId,
              revieweeId,
              rating: computeAverageRating(traits),
              traits,
              comment,
            },
            {
              onSuccess: (review) => {
                setSubmittedReview(review);
              },
            },
          );
        }}
        variant="dark"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  traits: {
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  existingReview: {
    marginTop: Spacing.md,
  },
});
