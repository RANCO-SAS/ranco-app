export type FeaturedProfessional = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  subcategoryId: string;
  subcategoryName: string;
  categorySlug: string;
  averageRating: number;
  reviewCount: number;
};

export type FeaturedProfessionalRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  subcategory_id: string;
  subcategory_name: string;
  category_slug: string;
  average_rating: number;
  review_count: number;
};

export type GetFeaturedProfessionalsInput = {
  limit?: number;
  subcategoryIds?: string[];
};
