import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateReviewInput, UpdateReviewEvidenceInput } from '@/features/reviews/types/review.types';
import { reviewService } from '@/features/reviews/services/review.service';
import { queryKeys } from '@/lib/query-keys';

export function useProfileReviews(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.profile(userId ?? 'unknown'),
    queryFn: () => reviewService.getReviewsForUser(userId!),
    enabled: Boolean(userId),
  });
}

export function useReviewPortfolio(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.portfolio(userId ?? 'unknown'),
    queryFn: () => reviewService.getReviewPortfolio(userId!),
    enabled: Boolean(userId),
  });
}

export function useRatedJobs(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.ratedJobs(userId ?? 'unknown'),
    queryFn: () => reviewService.getRatedJobs(userId!),
    enabled: Boolean(userId),
  });
}

export function useJobReview(serviceRequestId: string | undefined, reviewerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.job(serviceRequestId ?? 'unknown', reviewerId ?? 'unknown'),
    queryFn: () => reviewService.getReviewForJobByReviewer(serviceRequestId!, reviewerId!),
    enabled: Boolean(serviceRequestId && reviewerId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewService.createReview(input),
    onSuccess: (review) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.profile(review.revieweeId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.job(review.serviceRequestId, review.reviewerId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.portfolio(review.reviewerId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.ratedJobs(review.revieweeId),
      });
    },
  });
}

export function useUpdateReviewEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateReviewEvidenceInput) => reviewService.updateReviewEvidence(input),
    onSuccess: (review) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.job(review.serviceRequestId, review.reviewerId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.portfolio(review.reviewerId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.ratedJobs(review.revieweeId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}
