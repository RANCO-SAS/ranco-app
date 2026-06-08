import { apiGet } from '@/services/api/client';

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
    const searchParams = new URLSearchParams();

    if (params.limit) {
      searchParams.set('limit', String(params.limit));
    }

    if (params.subcategoryIds && params.subcategoryIds.length > 0) {
      searchParams.set('subcategoryIds', params.subcategoryIds.join(','));
    }

    const query = searchParams.toString();
    const path = query ? `/v1/app/home/featured?${query}` : '/v1/app/home/featured';

    return apiGet<ApiFeaturedProfessional[]>(path);
  },
};
