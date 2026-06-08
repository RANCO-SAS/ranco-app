import { apiGet, apiPatch, apiPost } from '@/services/api/client';

export type ApiReview = {
  id: string;
  serviceRequestId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeRole: string;
  rating: number;
  comment?: string | null;
  traits: Record<string, number>;
  evidenceUrls: string[];
  createdAt: string;
  reviewer?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  serviceRequest?: {
    title?: string;
  };
};

export type CreateReviewBody = {
  serviceRequestId: string;
  revieweeId: string;
  rating: number;
  comment?: string | null;
  traits?: Record<string, number>;
  evidenceUrls?: string[];
};

export const reviewRepository = {
  create(body: CreateReviewBody) {
    return apiPost<ApiReview>('/v1/app/reviews', body);
  },

  getById(reviewId: string) {
    return apiGet<ApiReview>(`/v1/app/reviews/${reviewId}`);
  },

  updateEvidence(reviewId: string, body: { evidenceUrls: string[] }) {
    return apiPatch<ApiReview>(`/v1/app/reviews/${reviewId}/evidence`, body);
  },

  getReviewsForUser(userId: string) {
    return apiGet<ApiReview[]>(`/v1/app/users/${userId}/reviews`);
  },

  getReviewsForJob(jobId: string) {
    return apiGet<ApiReview[]>(`/v1/app/jobs/${jobId}/reviews`);
  },
};
