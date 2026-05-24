import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    fullName: z.string().min(2, 'Ingresa tu nombre completo'),
    phone: z.string().optional(),
    locationLabel: z.string().optional(),
    avatarUrl: z
      .string()
      .optional()
      .refine((value) => !value || z.url().safeParse(value).success, 'Ingresa una URL válida'),
    isClient: z.boolean(),
    isProfessional: z.boolean(),
  })
  .refine((data) => data.isClient || data.isProfessional, {
    message: 'Selecciona al menos un rol: cliente o profesional',
    path: ['isClient'],
  });

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
