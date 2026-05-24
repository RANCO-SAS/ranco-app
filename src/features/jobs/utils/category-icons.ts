const CATEGORY_ICONS: Record<string, string> = {
  home: '🏠',
  repairs: '🔧',
  services: '🛎️',
  care: '💙',
  other: '✨',
};

const SUBCATEGORY_HINTS: Record<string, string> = {
  plumbing: 'Ej. Reparar fuga en el baño',
  electrical: 'Ej. Instalar tomas o arreglar cortocircuito',
  painting: 'Ej. Pintar habitación de 12 m²',
  cleaning: 'Ej. Limpieza profunda de apartamento',
  general: 'Ej. Arreglar puerta o mueble',
  mechanical: 'Ej. Revisión o reparación de moto',
  delivery: 'Ej. Mandado o entrega en la ciudad',
  cooking: 'Ej. Chef para cena en casa',
  pets: 'Ej. Paseo o cuidado de mascota',
  babysitting: 'Ej. Cuidado de niños por la tarde',
  tutoring: 'Ej. Clases de matemáticas',
  other: 'Ej. Describe brevemente lo que necesitas',
};

export function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] ?? '📋';
}

export function getSubcategoryTitleHint(slug: string): string {
  return SUBCATEGORY_HINTS[slug] ?? 'Ej. Describe en pocas palabras lo que necesitas';
}
