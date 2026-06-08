import {
  computeAverageRating,
  computeStoredReviewRating,
  filterReviewsByRole,
  getReviewTraitsForReviewee,
  type ReviewTraitDefinition,
  type ReviewTraits,
  type RevieweeRole,
} from '@/features/reviews/constants/review-traits';
import type { ApiReview } from '@/repositories/review.repository';
import type {
  CreateReviewInput,
  ProfileReviewsByRole,
  RatedJobItem,
  Review,
  ReviewPortfolioItem,
  RoleReviewSummary,
  UpdateReviewEvidenceInput,
} from '@/features/reviews/types/review.types';
import { reviewRepository } from '@/repositories/review.repository';
import { storageService } from '@/services/storage/storage.service';

function mapApiReview(row: ApiReview): Review {
  const traits = row.traits ?? {};

  return {
    id: row.id,
    serviceRequestId: row.serviceRequestId,
    reviewerId: row.reviewerId,
    revieweeId: row.revieweeId,
    revieweeRole: row.revieweeRole as Review['revieweeRole'],
    rating: row.rating,
    traits,
    comment: row.comment ?? null,
    evidenceUrls: row.evidenceUrls ?? [],
    createdAt: row.createdAt,
    reviewerName: row.reviewer?.fullName ?? 'Usuario',
    reviewerAvatarUrl: row.reviewer?.avatarUrl ?? null,
    serviceRequestTitle: row.serviceRequest?.title,
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

async function uploadEvidencePhotos(
  reviewerId: string,
  serviceRequestId: string,
  photoUris: string[],
): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (let index = 0; index < photoUris.length; index += 1) {
    const uploadedUrl = await storageService.uploadReviewEvidence(
      reviewerId,
      serviceRequestId,
      photoUris[index],
      index,
    );
    uploadedUrls.push(uploadedUrl);
  }

  return uploadedUrls;
}

async function createReview(input: CreateReviewInput): Promise<Review> {
  const evidenceUrls = input.evidencePhotoUris?.length
    ? await uploadEvidencePhotos(input.reviewerId, input.serviceRequestId, input.evidencePhotoUris)
    : [];

  const data = await reviewRepository.create({
    serviceRequestId: input.serviceRequestId,
    revieweeId: input.revieweeId,
    rating: computeStoredReviewRating(input.traits),
    traits: input.traits,
    comment: input.comment?.trim() || null,
    evidenceUrls,
  });

  return mapApiReview(data);
}

async function updateReviewEvidence(input: UpdateReviewEvidenceInput): Promise<Review> {
  const current = await getReviewById(input.reviewId);

  if (!current || current.reviewerId !== input.reviewerId) {
    throw new Error('No puedes actualizar la evidencia de esta reseña.');
  }

  const removedUrls = current.evidenceUrls.filter((url) => !input.evidenceUrls.includes(url));

  if (removedUrls.length > 0) {
    await storageService.deleteReviewEvidenceUrls(removedUrls);
  }

  const data = await reviewRepository.updateEvidence(input.reviewId, {
    evidenceUrls: input.evidenceUrls,
  });

  return mapApiReview(data);
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
  const data = await reviewRepository.getReviewsForUser(userId);
  const reviews = data.map(mapApiReview);

  return {
    client: buildRoleReviewSummary(reviews, 'client'),
    professional: buildRoleReviewSummary(reviews, 'professional'),
  };
}

async function getReviewForJobByReviewer(
  serviceRequestId: string,
  reviewerId: string,
): Promise<Review | null> {
  const data = await reviewRepository.getReviewsForJob(serviceRequestId);
  const match = data.find((review) => review.reviewerId === reviewerId);
  return match ? mapApiReview(match) : null;
}

async function getReviewById(reviewId: string): Promise<Review | null> {
  try {
    const data = await reviewRepository.getById(reviewId);
    return mapApiReview(data);
  } catch {
    return null;
  }
}

async function getReviewPortfolio(userId: string): Promise<ReviewPortfolioItem[]> {
  const data = await reviewRepository.getReviewsForUser(userId);

  return data
    .filter((row) => row.reviewerId === userId && (row.evidenceUrls?.length ?? 0) > 0)
    .map((row) => ({
      reviewId: row.id,
      serviceRequestId: row.serviceRequestId,
      title: row.serviceRequest?.title ?? 'Trabajo',
      rating: row.rating,
      comment: row.comment ?? null,
      evidenceUrls: row.evidenceUrls ?? [],
      createdAt: row.createdAt,
    }));
}

async function getRatedJobs(userId: string, role?: RevieweeRole): Promise<RatedJobItem[]> {
  const data = await reviewRepository.getReviewsForUser(userId);

  const receivedReviews = data.filter((row) => {
    if (!role) {
      return true;
    }

    return filterReviewsByRole(
      [{ traits: row.traits ?? {}, revieweeRole: row.revieweeRole }],
      role,
    ).length > 0;
  });

  if (receivedReviews.length === 0) {
    return [];
  }

  const ownEvidenceByJob = new Map<string, string[]>();

  for (const row of receivedReviews) {
    if (row.reviewerId === userId) {
      ownEvidenceByJob.set(row.serviceRequestId, row.evidenceUrls ?? []);
    }
  }

  return receivedReviews.map((row) => ({
    reviewId: row.id,
    serviceRequestId: row.serviceRequestId,
    title: row.serviceRequest?.title ?? 'Trabajo',
    rating: row.rating,
    reviewerName: row.reviewer?.fullName ?? 'Usuario',
    comment: row.comment ?? null,
    createdAt: row.createdAt,
    ownEvidenceUrls: ownEvidenceByJob.get(row.serviceRequestId) ?? [],
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
