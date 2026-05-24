import type { ReviewRow } from '@/features/reviews/types/review-db.types';
import type { CreateReviewInput, ProfileReviewSummary, Review } from '@/features/reviews/types/review.types';
import { getSupabaseClient } from '@/services/supabase/client';

const REVIEWS_TABLE = 'reviews';

function mapReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    serviceRequestId: row.service_request_id,
    reviewerId: row.reviewer_id,
    revieweeId: row.reviewee_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    reviewerName: row.reviewer?.full_name ?? 'Usuario',
  };
}

async function createReview(input: CreateReviewInput): Promise<Review> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REVIEWS_TABLE)
    .insert({
      service_request_id: input.serviceRequestId,
      reviewer_id: input.reviewerId,
      reviewee_id: input.revieweeId,
      rating: input.rating,
      comment: input.comment?.trim() || null,
    })
    .select('*, reviewer:reviewer_id(full_name)')
    .single();

  if (error) {
    throw error;
  }

  return mapReviewRow(data as ReviewRow);
}

async function getReviewsForUser(userId: string): Promise<ProfileReviewSummary> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REVIEWS_TABLE)
    .select('*, reviewer:reviewer_id(full_name)')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const reviews = ((data ?? []) as ReviewRow[]).map(mapReviewRow);
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  return {
    averageRating,
    totalReviews,
    reviews,
  };
}

async function getReviewForJobByReviewer(
  serviceRequestId: string,
  reviewerId: string,
): Promise<Review | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REVIEWS_TABLE)
    .select('*, reviewer:reviewer_id(full_name)')
    .eq('service_request_id', serviceRequestId)
    .eq('reviewer_id', reviewerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapReviewRow(data as ReviewRow);
}

export const reviewService = {
  createReview,
  getReviewsForUser,
  getReviewForJobByReviewer,
};
