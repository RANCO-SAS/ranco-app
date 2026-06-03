import { useQuery } from '@tanstack/react-query';

import { featuredProfessionalsService } from '@/features/home/services/featured-professionals.service';
import { queryKeys } from '@/lib/query-keys';

const FEATURED_PROFESSIONALS_STALE_MS = 5 * 60 * 1000;

type UseFeaturedProfessionalsOptions = {
  subcategoryIds?: string[];
  limit?: number;
  enabled?: boolean;
};

export function useFeaturedProfessionals({
  subcategoryIds,
  limit,
  enabled = true,
}: UseFeaturedProfessionalsOptions = {}) {
  const subcategoryKey = subcategoryIds?.slice().sort().join(',') ?? 'all';

  return useQuery({
    queryKey: queryKeys.featuredProfessionals.list(subcategoryKey),
    queryFn: () =>
      featuredProfessionalsService.getFeaturedProfessionals({
        limit,
        subcategoryIds,
      }),
    enabled,
    staleTime: FEATURED_PROFESSIONALS_STALE_MS,
  });
}

export function isTopFeaturedProfessional(professional: {
  averageRating: number;
  reviewCount: number;
}): boolean {
  return professional.averageRating >= 4.8 || professional.reviewCount >= 5;
}
