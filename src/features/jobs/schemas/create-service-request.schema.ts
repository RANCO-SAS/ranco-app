import { z } from 'zod';

export const createServiceRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(80, 'El título no puede superar 80 caracteres'),
  description: z
    .string()
    .trim()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(1000, 'La descripción no puede superar 1000 caracteres'),
  categoryId: z.string().uuid('Selecciona una categoría'),
  subcategoryId: z.string().uuid('Selecciona una subcategoría'),
  urgency: z.enum(['low', 'normal', 'high', 'urgent']),
  locationLabel: z
    .string()
    .trim()
    .max(120, 'La ubicación no puede superar 120 caracteres')
    .optional()
    .or(z.literal('')),
  locationLat: z
    .number()
    .min(-90, 'Marca la ubicación en el mapa')
    .max(90, 'Marca la ubicación en el mapa'),
  locationLng: z
    .number()
    .min(-180, 'Marca la ubicación en el mapa')
    .max(180, 'Marca la ubicación en el mapa'),
});

export type CreateServiceRequestFormData = z.infer<typeof createServiceRequestSchema>;
