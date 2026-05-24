import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Ingresa tu nombre completo'),
  phone: z.string().optional().or(z.literal('')),
  locationLabel: z.string().optional().or(z.literal('')),
  avatarUrl: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || z.url().safeParse(value).success, 'Ingresa una URL válida'),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
