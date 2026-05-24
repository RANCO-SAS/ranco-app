export type Review = {
  id: string;
  serviceRequestId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerName: string;
};

export type CreateReviewInput = {
  serviceRequestId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
};

export type ProfileReviewSummary = {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
};
