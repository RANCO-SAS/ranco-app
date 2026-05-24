export type ServiceSubcategory = {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type ServiceCategory = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  subcategories: ServiceSubcategory[];
};
