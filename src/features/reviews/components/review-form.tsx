import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { ReviewEvidenceUploader } from '@/features/reviews/components/review-evidence-uploader';
import { ReviewDetailCard } from '@/features/reviews/components/review-detail-card';
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
  const router = useRouter();
  const createReview = useCreateReview();
  const traitDefinitions = getReviewTraitsForReviewee(revieweeIsProfessional);
  const [traits, setTraits] = useState<ReviewTraits>(
    existingReview?.traits ?? buildDefaultTraits(traitDefinitions),
  );
  const [comment, setComment] = useState('');
  const [submittedReview, setSubmittedReview] = useState<Review | null>(existingReview ?? null);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeReview = submittedReview ?? existingReview ?? null;

  useEffect(() => {
    if (!existingReview) {
      return;
    }

    setSubmittedReview(existingReview);
    setIsExpanded(false);
  }, [existingReview]);

  if (activeReview) {
    return (
      <Card style={styles.compactCard}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsExpanded((value) => !value)}
          style={styles.compactHeader}>
          <View style={styles.compactMeta}>
            <AppText variant="bodyMedium">Tu reseña · {activeReview.rating.toFixed(1)}★</AppText>
            {!isExpanded && activeReview.comment ? (
              <AppText color="textSecondary" numberOfLines={1} variant="caption">
                {activeReview.comment}
              </AppText>
            ) : null}
          </View>
          <AppText color="textMuted" variant="body">
            {isExpanded ? '▲' : '▼'}
          </AppText>
        </Pressable>

        {isExpanded ? (
          <>
            <Spacer size="md" />
            <ReviewDetailCard
              review={activeReview}
              revieweeIsProfessional={revieweeIsProfessional}
              showReviewerLink={false}
            />
            <ReviewEvidenceUploader
              initialUrls={activeReview.evidenceUrls}
              reviewId={activeReview.id}
              reviewerId={reviewerId}
            />
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(Routes.app.reviewDetail(activeReview.id))}
            style={styles.detailLink}>
            <AppText color="primary" variant="caption">
              Ver detalle completo ›
            </AppText>
          </Pressable>
        )}
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
                setIsExpanded(false);
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
  compactCard: {
    paddingVertical: Spacing.md,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  compactMeta: {
    flex: 1,
    gap: 2,
  },
  detailLink: {
    marginTop: Spacing.sm,
  },
  traits: {
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
});
