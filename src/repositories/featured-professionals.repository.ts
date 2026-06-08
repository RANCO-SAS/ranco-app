import { apiGet } from '@/services/api/client';
import { buildSnakeCaseQuery } from '@/services/api/case-transform';

export type ApiFeaturedProfessional = {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  subcategoryId: string;
  subcategoryName: string;
  categorySlug: string;
  averageRating: number;
  reviewCount: number;
  isPro: boolean;
};

export type GetFeaturedProfessionalsParams = {
  limit?: number;
  subcategoryIds?: string[];
};

export const featuredProfessionalsRepository = {
  getFeatured(params: GetFeaturedProfessionalsParams = {}) {
    const path = `/v1/app/home/featured${buildSnakeCaseQuery({
      limit: params.limit,
      subcategoryIds: params.subcategoryIds?.join(','),
    })}`;

    return apiGet<ApiFeaturedProfessional[]>(path);
  },
};
