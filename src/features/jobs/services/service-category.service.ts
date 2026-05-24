import type {
  ServiceCategoryRow,
  ServiceSubcategoryRow,
} from '@/features/jobs/types/service-category-db.types';
import type { ServiceCategory } from '@/features/jobs/types/service-category.types';
import { mapServiceCategoryRows } from '@/features/jobs/services/service-category.mapper';
import { getSupabaseClient } from '@/services/supabase/client';

async function getCategories(): Promise<ServiceCategory[]> {
  const supabase = getSupabaseClient();

  const [categoriesResult, subcategoriesResult] = await Promise.all([
    supabase.from('service_categories').select('*').order('sort_order'),
    supabase.from('service_subcategories').select('*').order('sort_order'),
  ]);

  if (categoriesResult.error) {
    throw categoriesResult.error;
  }

  if (subcategoriesResult.error) {
    throw subcategoriesResult.error;
  }

  return mapServiceCategoryRows(
    categoriesResult.data as ServiceCategoryRow[],
    subcategoriesResult.data as ServiceSubcategoryRow[],
  ).sort((left, right) => left.sortOrder - right.sortOrder);
}

export const serviceCategoryService = {
  getCategories,
};
