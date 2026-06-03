import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { ReviewEvidencePicker } from '@/features/reviews/components/review-evidence-picker';
import { ReviewFormSectionLabel } from '@/features/reviews/components/review-form-section-label';
import { ReviewSubmittedSummaryCard } from '@/features/reviews/components/review-submitted-summary-card';
import { TraitRatingRow } from '@/features/reviews/components/trait-rating-row';
import {
  buildDefaultTraits,
  computeStoredReviewRating,
  getReviewTraitsForReviewee,
  validateTraits,
  type ReviewTraits,
} from '@/features/reviews/constants/review-traits';
import { useCreateReview, useUpdateReviewEvidence } from '@/features/reviews/hooks/use-reviews';
import { reviewService } from '@/features/reviews/services/review.service';
import type { Review } from '@/features/reviews/types/review.types';
import { getReviewSubmitErrorMessage } from '@/features/reviews/utils/get-review-submit-error-message';
import { type ServiceRequestPhotoItem } from '@/features/jobs/types/service-request-photo.types';
import { useTheme } from '@/hooks/use-theme';
import { queryKeys } from '@/lib/query-keys';
import { storageService } from '@/services/storage/storage.service';

type ReviewFormProps = {
  serviceRequestId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeName: string;
  revieweeIsProfessional: boolean;
  existingReview?: Review | null;
};

async function uploadDraftEvidence(
  review: Review,
  reviewerId: string,
  photos: ServiceRequestPhotoItem[],
  updateEvidence: ReturnType<typeof useUpdateReviewEvidence>,
): Promise<Review> {
  const localPhotos = photos.filter((photo) => !photo.isRemote);

  if (localPhotos.length === 0) {
    return review;
  }

  const uploadedUrls: string[] = [];

  for (let index = 0; index < localPhotos.length; index += 1) {
    const uploadedUrl = await storageService.uploadReviewEvidence(
      reviewerId,
      review.id,
      localPhotos[index].uri,
      index,
    );
    uploadedUrls.push(uploadedUrl);
  }

  return updateEvidence.mutateAsync({
    reviewId: review.id,
    reviewerId,
    evidenceUrls: uploadedUrls,
  });
}

export function ReviewForm({
  serviceRequestId,
  reviewerId,
  revieweeId,
  revieweeName,
  revieweeIsProfessional,
  existingReview,
}: ReviewFormProps) {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const createReview = useCreateReview();
  const updateEvidence = useUpdateReviewEvidence();
  const traitDefinitions = getReviewTraitsForReviewee(revieweeIsProfessional);
  const [traits, setTraits] = useState<ReviewTraits>(
    existingReview?.traits ?? buildDefaultTraits(traitDefinitions),
  );
  const [comment, setComment] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState<ServiceRequestPhotoItem[]>([]);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(existingReview ?? null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activeReview =
    submittedReview ??
    existingReview ??
    (createReview.isSuccess ? createReview.data : null);
  const isSubmitting = createReview.isPending || isUploadingEvidence;

  useEffect(() => {
    if (!existingReview) {
      return;
    }

    setSubmittedReview((current) => current ?? existingReview);
    setIsExpanded(false);
  }, [existingReview]);

  const handleSubmitSuccess = (review: Review) => {
    setSubmitError(null);
    setSubmittedReview(review);

    if (evidencePhotos.length === 0) {
      setIsExpanded(false);
      return;
    }

    setIsUploadingEvidence(true);
    void uploadDraftEvidence(review, reviewerId, evidencePhotos, updateEvidence)
      .then((nextReview) => {
        setSubmittedReview(nextReview);
        setIsExpanded(false);
      })
      .catch(() => {
        setIsExpanded(false);
      })
      .finally(() => {
        setIsUploadingEvidence(false);
      });
  };

  if (activeReview) {
    return (
      <ReviewSubmittedSummaryCard
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded((value) => !value)}
        onViewDetail={() => router.push(Routes.app.reviewDetail(activeReview.id))}
        review={activeReview}
        revieweeIsProfessional={revieweeIsProfessional}
        reviewerId={reviewerId}
      />
    );
  }

  const canSubmit = validateTraits(traits, traitDefinitions);

  return (
    <Card style={styles.formCard}>
      <AppText variant="bodyMedium">Valorar a {revieweeName}</AppText>

      <View style={[styles.traitsCard, { backgroundColor: theme.backgroundElement }]}>
        {traitDefinitions.map((definition) => (
          <TraitRatingRow
            definition={definition}
            disabled={isSubmitting}
            key={definition.key}
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

      <View style={styles.commentSection}>
        <ReviewFormSectionLabel>Comentarios adicionales</ReviewFormSectionLabel>
        <TextInput
          editable={!isSubmitting}
          multiline
          numberOfLines={4}
          onChangeText={setComment}
          placeholder="Cuéntanos cómo fue la experiencia..."
          placeholderTextColor={theme.textMuted}
          style={[
            styles.commentInput,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          textAlignVertical="top"
          value={comment}
        />
      </View>

      <ReviewEvidencePicker
        disabled={isSubmitting}
        onChange={setEvidencePhotos}
        photos={evidencePhotos}
      />

      {submitError ? (
        <AppText color="destructive" variant="caption">
          {submitError}
        </AppText>
      ) : null}

      <AnimatedPressable
        accessibilityRole="button"
        disabled={isSubmitting || !canSubmit}
        onPress={() => {
          if (!validateTraits(traits, traitDefinitions)) {
            return;
          }

          setSubmitError(null);
          createReview.mutate(
            {
              serviceRequestId,
              reviewerId,
              revieweeId,
              revieweeRole: revieweeIsProfessional ? 'professional' : 'client',
              rating: computeStoredReviewRating(traits),
              traits,
              comment: comment.trim() || undefined,
            },
            {
              onSuccess: handleSubmitSuccess,
              onError: (error) => {
                const message = getReviewSubmitErrorMessage(error);
                setSubmitError(message);

                if (
                  error instanceof Error &&
                  (error.message.toLowerCase().includes('duplicate') ||
                    error.message.toLowerCase().includes('unique'))
                ) {
                  void reviewService
                    .getReviewForJobByReviewer(serviceRequestId, reviewerId)
                    .then((review) => {
                      if (!review) {
                        return;
                      }

                      queryClient.setQueryData(
                        queryKeys.reviews.job(serviceRequestId, reviewerId),
                        review,
                      );
                      setSubmittedReview(review);
                      setSubmitError(null);
                    });
                }
              },
            },
          );
        }}
        style={[
          styles.submitButton,
          {
            backgroundColor: theme.primary,
            opacity: isSubmitting || !canSubmit ? 0.5 : 1,
          },
        ]}>
        <AppText color="primaryForeground" variant="bodyMedium">
          {isSubmitting ? 'Publicando reseña...' : 'Publicar reseña'}
        </AppText>
        <AppIcon color={theme.primaryForeground} name="send-outline" size={18} />
      </AnimatedPressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: Spacing.lg,
    borderRadius: Radius.xl,
  },
  traitsCard: {
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  commentSection: {
    gap: Spacing.sm,
  },
  commentInput: {
    minHeight: 112,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    lineHeight: 22,
  },
  submitButton: {
    minHeight: Layout.minTouchTarget + 4,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
});
