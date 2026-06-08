import { apiGet } from '@/services/api/client';

export type ApiServiceSubcategory = {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  sortOrder: number;
  createdAt?: string;
};

export type ApiCategoryWithSubcategories = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  createdAt?: string;
  subcategories: ApiServiceSubcategory[];
};

export const serviceCategoryRepository = {
  getCategories() {
    return apiGet<ApiCategoryWithSubcategories[]>('/v1/app/categories');
  },
};
