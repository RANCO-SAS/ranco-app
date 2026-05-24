import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateReviewInput } from '@/features/reviews/types/review.types';
import { reviewService } from '@/features/reviews/services/review.service';
import { queryKeys } from '@/lib/query-keys';

export function useProfileReviews(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.profile(userId ?? 'unknown'),
    queryFn: () => reviewService.getReviewsForUser(userId!),
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
    },
  });
}
