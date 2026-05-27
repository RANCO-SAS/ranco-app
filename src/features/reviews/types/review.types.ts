import type { ReviewTraits } from '@/features/reviews/constants/review-traits';

export type Review = {
  id: string;
  serviceRequestId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  traits: ReviewTraits;
  comment: string | null;
  evidenceUrls: string[];
  createdAt: string;
  reviewerName: string;
  serviceRequestTitle?: string;
};

export type CreateReviewInput = {
  serviceRequestId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  traits: ReviewTraits;
  comment?: string;
};

export type UpdateReviewEvidenceInput = {
  reviewId: string;
  reviewerId: string;
  evidenceUrls: string[];
};

export type ReviewPortfolioItem = {
  reviewId: string;
  serviceRequestId: string;
  title: string;
  rating: number;
  comment: string | null;
  evidenceUrls: string[];
  createdAt: string;
};

export type RatedJobItem = {
  reviewId: string;
  serviceRequestId: string;
  title: string;
  rating: number;
  reviewerName: string;
  comment: string | null;
  createdAt: string;
  ownEvidenceUrls: string[];
};

export type ProfileReviewSummary = {
  averageRating: number;
  totalReviews: number;
  traitAverages: ReviewTraits;
  reviews: Review[];
};
