import type {
  FeaturedProfessional,
  GetFeaturedProfessionalsInput,
} from '@/features/home/types/featured-professional.types';
import { featuredProfessionalsRepository } from '@/repositories/featured-professionals.repository';

async function getFeaturedProfessionals(
  input: GetFeaturedProfessionalsInput = {},
): Promise<FeaturedProfessional[]> {
  const data = await featuredProfessionalsRepository.getFeatured(input);

  return data.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    avatarUrl: row.avatarUrl ?? null,
    subcategoryId: row.subcategoryId,
    subcategoryName: row.subcategoryName,
    categorySlug: row.categorySlug,
    averageRating: Number(row.averageRating),
    reviewCount: Number(row.reviewCount),
    isPro: Boolean(row.isPro),
  }));
}

export const featuredProfessionalsService = {
  getFeaturedProfessionals,
};
