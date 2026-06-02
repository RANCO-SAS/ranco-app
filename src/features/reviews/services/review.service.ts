import {
  computeAverageRating,
  computeStoredReviewRating,
  filterReviewsByRole,
  getReviewTraitsForReviewee,
  type ReviewTraitDefinition,
  type ReviewTraits,
  type RevieweeRole,
} from '@/features/reviews/constants/review-traits';
import type { ReviewRow } from '@/features/reviews/types/review-db.types';
import type {
  CreateReviewInput,
  ProfileReviewsByRole,
  RatedJobItem,
  Review,
  ReviewPortfolioItem,
  RoleReviewSummary,
  UpdateReviewEvidenceInput,
} from '@/features/reviews/types/review.types';
import { getSupabaseClient } from '@/services/supabase/client';
import { storageService } from '@/services/storage/storage.service';

const REVIEWS_TABLE = 'reviews';

const REVIEW_SELECT =
  '*, reviewer:reviewer_id(full_name, avatar_url), service_request:service_request_id(title)';

function mapReviewRow(row: ReviewRow): Review {
  const traits = row.traits ?? {};

  return {
    id: row.id,
    serviceRequestId: row.service_request_id,
    reviewerId: row.reviewer_id,
    revieweeId: row.reviewee_id,
    revieweeRole: row.reviewee_role,
    rating: row.rating,
    traits,
    comment: row.comment,
    evidenceUrls: row.evidence_urls ?? [],
    createdAt: row.created_at,
    reviewerName: row.reviewer?.full_name ?? 'Usuario',
    reviewerAvatarUrl: row.reviewer?.avatar_url ?? null,
    serviceRequestTitle: row.service_request?.title,
  };
}

function computeTraitAverages(
  reviews: Review[],
  definitions: ReviewTraitDefinition[],
): ReviewTraits {
  if (reviews.length === 0) {
    return {};
  }

  return definitions.reduce<ReviewTraits>((averages, definition) => {
    const values = reviews
      .map((review) => review.traits[definition.key])
      .filter((value): value is number => typeof value === 'number');

    if (values.length === 0) {
      return averages;
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    averages[definition.key] = Math.round((total / values.length) * 10) / 10;
    return averages;
  }, {});
}

async function createReview(input: CreateReviewInput): Promise<Review> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REVIEWS_TABLE)
    .insert({
      service_request_id: input.serviceRequestId,
      reviewer_id: input.reviewerId,
      reviewee_id: input.revieweeId,
      reviewee_role: input.revieweeRole,
      rating: computeStoredReviewRating(input.traits),
      traits: input.traits,
      comment: input.comment?.trim() || null,
      evidence_urls: [],
    })
    .select(REVIEW_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapReviewRow(data as ReviewRow);
}

async function updateReviewEvidence(input: UpdateReviewEvidenceInput): Promise<Review> {
  const supabase = getSupabaseClient();
  const current = await supabase
    .from(REVIEWS_TABLE)
    .select('id, reviewer_id, evidence_urls')
    .eq('id', input.reviewId)
    .eq('reviewer_id', input.reviewerId)
    .maybeSingle();

  if (current.error) {
    throw current.error;
  }

  if (!current.data) {
    throw new Error('No puedes actualizar la evidencia de esta reseña.');
  }

  const previousUrls = (current.data.evidence_urls ?? []) as string[];
  const removedUrls = previousUrls.filter((url) => !input.evidenceUrls.includes(url));

  if (removedUrls.length > 0) {
    await storageService.deleteReviewEvidenceUrls(removedUrls);
  }

  const { data, error } = await supabase
    .from(REVIEWS_TABLE)
    .update({ evidence_urls: input.evidenceUrls })
    .eq('id', input.reviewId)
    .eq('reviewer_id', input.reviewerId)
    .select(REVIEW_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapReviewRow(data as ReviewRow);
}

function buildRoleReviewSummary(reviews: Review[], role: RevieweeRole): RoleReviewSummary {
  const filtered = filterReviewsByRole(reviews, role);
  const traitDefinitions = getReviewTraitsForReviewee(role === 'professional');
  const traitAverages = computeTraitAverages(filtered, traitDefinitions);
  const weightedAverage = computeAverageRating(traitAverages);
  const fallbackAverage =
    filtered.length === 0
      ? 0
      : filtered.reduce((sum, review) => sum + review.rating, 0) / filtered.length;
  const averageRating = weightedAverage > 0 ? weightedAverage : fallbackAverage;

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: filtered.length,
    traitAverages,
    reviews: filtered,
  };
}

async function getReviewsForUser(userId: string): Promise<ProfileReviewsByRole> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REVIEWS_TABLE)
    .select(REVIEW_SELECT)
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const reviews = ((data ?? []) as ReviewRow[]).map(mapReviewRow);

  return {
    client: buildRoleReviewSummary(reviews, 'client'),
    professional: buildRoleReviewSummary(reviews, 'professional'),
  };
}

async function getReviewForJobByReviewer(
  serviceRequestId: string,
  reviewerId: string,
): Promise<Review | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REVIEWS_TABLE)
    .select(REVIEW_SELECT)
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

async function getReviewById(reviewId: string): Promise<Review | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REVIEWS_TABLE)
    .select(REVIEW_SELECT)
    .eq('id', reviewId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapReviewRow(data as ReviewRow);
}

async function getReviewPortfolio(userId: string): Promise<ReviewPortfolioItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REVIEWS_TABLE)
    .select(REVIEW_SELECT)
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ReviewRow[])
    .filter((row) => (row.evidence_urls?.length ?? 0) > 0)
    .map((row) => ({
      reviewId: row.id,
      serviceRequestId: row.service_request_id,
      title: row.service_request?.title ?? 'Trabajo',
      rating: row.rating,
      comment: row.comment,
      evidenceUrls: row.evidence_urls ?? [],
      createdAt: row.created_at,
    }));
}

async function getRatedJobs(userId: string, role?: RevieweeRole): Promise<RatedJobItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(REVIEWS_TABLE)
    .select(REVIEW_SELECT)
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const receivedReviews = ((data ?? []) as ReviewRow[]).filter((row) => {
    if (!role) {
      return true;
    }

    return filterReviewsByRole(
      [{ traits: row.traits ?? {}, revieweeRole: row.reviewee_role }],
      role,
    ).length > 0;
  });

  if (receivedReviews.length === 0) {
    return [];
  }

  const serviceRequestIds = receivedReviews.map((row) => row.service_request_id);
  const { data: authoredReviews, error: authoredError } = await supabase
    .from(REVIEWS_TABLE)
    .select('service_request_id, evidence_urls')
    .eq('reviewer_id', userId)
    .in('service_request_id', serviceRequestIds);

  if (authoredError) {
    throw authoredError;
  }

  const ownEvidenceByJob = new Map<string, string[]>(
    (authoredReviews ?? []).map((review) => [
      review.service_request_id as string,
      (review.evidence_urls ?? []) as string[],
    ]),
  );

  return receivedReviews.map((row) => ({
    reviewId: row.id,
    serviceRequestId: row.service_request_id,
    title: row.service_request?.title ?? 'Trabajo',
    rating: row.rating,
    reviewerName: row.reviewer?.full_name ?? 'Usuario',
    comment: row.comment,
    createdAt: row.created_at,
    ownEvidenceUrls: ownEvidenceByJob.get(row.service_request_id) ?? [],
  }));
}

export const reviewService = {
  createReview,
  updateReviewEvidence,
  getReviewsForUser,
  getReviewById,
  getReviewForJobByReviewer,
  getReviewPortfolio,
  getRatedJobs,
  computeTraitAverages,
  computeAverageRating,
};
