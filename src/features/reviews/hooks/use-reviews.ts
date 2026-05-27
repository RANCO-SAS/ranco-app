import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateReviewInput, ProfileReviewsByRole, RoleReviewSummary, UpdateReviewEvidenceInput } from '@/features/reviews/types/review.types';
import type { RevieweeRole } from '@/features/reviews/constants/review-traits';
import { reviewService } from '@/features/reviews/services/review.service';
import { queryKeys } from '@/lib/query-keys';

export function selectRoleReviewSummary(
  data: ProfileReviewsByRole | undefined,
  role: RevieweeRole,
): RoleReviewSummary | undefined {
  return data?.[role];
}

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

export function useRatedJobs(userId: string | undefined, role?: RevieweeRole) {
  return useQuery({
    queryKey: queryKeys.reviews.ratedJobs(userId ?? 'unknown', role),
    queryFn: () => reviewService.getRatedJobs(userId!, role),
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

export function useReview(reviewId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.detail(reviewId ?? 'unknown'),
    queryFn: () => reviewService.getReviewById(reviewId!),
    enabled: Boolean(reviewId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewService.createReview(input),
    onSuccess: (review) => {
      queryClient.setQueryData(queryKeys.reviews.detail(review.id), review);
      queryClient.setQueryData(
        queryKeys.reviews.job(review.serviceRequestId, review.reviewerId),
        review,
      );
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
      queryClient.setQueryData(queryKeys.reviews.detail(review.id), review);
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
