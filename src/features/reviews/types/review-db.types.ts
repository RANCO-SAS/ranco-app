import type { ReviewTraits } from '@/features/reviews/constants/review-traits';

export type ReviewRow = {
  id: string;
  service_request_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  traits: ReviewTraits;
  comment: string | null;
  evidence_urls: string[];
  created_at: string;
  reviewer: {
    full_name: string;
  } | null;
  service_request?: {
    title: string;
  } | null;
};
