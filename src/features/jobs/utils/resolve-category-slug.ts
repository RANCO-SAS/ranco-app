const CATEGORY_NAME_SLUGS: Record<string, string> = {
  hogar: 'home',
  home: 'home',
  reparaciones: 'repairs',
  servicios: 'services',
  cuidado: 'care',
  transporte: 'transport',
  belleza: 'beauty',
  educación: 'education',
  educacion: 'education',
  eventos: 'events',
};

export function resolveCategorySlug(categoryName: string | null | undefined): string {
  if (!categoryName?.trim()) {
    return 'other';
  }

  const normalized = categoryName.trim().toLowerCase();

  return CATEGORY_NAME_SLUGS[normalized] ?? 'other';
}
