import type { ReviewTraits, RevieweeRole } from '@/features/reviews/constants/review-traits';

export type ReviewRow = {
  id: string;
  service_request_id: string;
  reviewer_id: string;
  reviewee_id: string;
  reviewee_role: RevieweeRole;
  rating: number;
  traits: ReviewTraits;
  comment: string | null;
  evidence_urls: string[];
  created_at: string;
  reviewer: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  service_request?: {
    title: string;
  } | null;
};
