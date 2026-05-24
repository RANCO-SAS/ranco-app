export type ServiceCategoryRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

export type ServiceSubcategoryRow = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  sort_order: number;
};
