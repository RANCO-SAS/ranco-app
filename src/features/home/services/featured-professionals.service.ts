import type {
  FeaturedProfessional,
  FeaturedProfessionalRow,
  GetFeaturedProfessionalsInput,
} from '@/features/home/types/featured-professional.types';
import { getSupabaseClient } from '@/services/supabase/client';

const DEFAULT_LIMIT = 8;

function mapFeaturedProfessionalRow(row: FeaturedProfessionalRow): FeaturedProfessional {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    subcategoryId: row.subcategory_id,
    subcategoryName: row.subcategory_name,
    categorySlug: row.category_slug,
    averageRating: Number(row.average_rating),
    reviewCount: Number(row.review_count),
    isPro: Boolean(row.is_pro),
  };
}

async function getFeaturedProfessionals(
  input: GetFeaturedProfessionalsInput = {},
): Promise<FeaturedProfessional[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('get_featured_professionals', {
    p_limit: input.limit ?? DEFAULT_LIMIT,
    p_subcategory_ids:
      input.subcategoryIds && input.subcategoryIds.length > 0 ? input.subcategoryIds : null,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as FeaturedProfessionalRow[]).map(mapFeaturedProfessionalRow);
}

export const featuredProfessionalsService = {
  getFeaturedProfessionals,
};
