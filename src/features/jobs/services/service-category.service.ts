import type { ServiceCategory } from '@/features/jobs/types/service-category.types';
import { serviceCategoryRepository } from '@/repositories/service-category.repository';

async function getCategories(): Promise<ServiceCategory[]> {
  const categories = await serviceCategoryRepository.getCategories();

  return categories
    .map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      sortOrder: category.sortOrder,
      subcategories: (category.subcategories ?? [])
        .map((subcategory) => ({
          id: subcategory.id,
          categoryId: subcategory.categoryId,
          slug: subcategory.slug,
          name: subcategory.name,
          sortOrder: subcategory.sortOrder,
        }))
        .sort((left, right) => left.sortOrder - right.sortOrder),
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export const serviceCategoryService = {
  getCategories,
};
