import { useQuery } from '@tanstack/react-query';

import { serviceCategoryService } from '@/features/jobs/services/service-category.service';
import { queryKeys } from '@/lib/query-keys';

export function useServiceCategories() {
  return useQuery({
    queryKey: queryKeys.jobs.categories,
    queryFn: () => serviceCategoryService.getCategories(),
  });
}
