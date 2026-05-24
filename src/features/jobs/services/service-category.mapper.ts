import type {
  ServiceCategoryRow,
  ServiceSubcategoryRow,
} from '@/features/jobs/types/service-category-db.types';
import type { ServiceCategory, ServiceSubcategory } from '@/features/jobs/types/service-category.types';

export function mapServiceSubcategoryRow(row: ServiceSubcategoryRow): ServiceSubcategory {
  return {
    id: row.id,
    categoryId: row.category_id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
  };
}

export function mapServiceCategoryRows(
  categories: ServiceCategoryRow[],
  subcategories: ServiceSubcategoryRow[],
): ServiceCategory[] {
  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    sortOrder: category.sort_order,
    subcategories: subcategories
      .filter((subcategory) => subcategory.category_id === category.id)
      .map(mapServiceSubcategoryRow)
      .sort((left, right) => left.sortOrder - right.sortOrder),
  }));
}
