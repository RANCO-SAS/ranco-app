import { z } from 'zod';

import { PROFESSIONAL_SERVICE_SELECTION } from '@/constants/profile';

export const onboardingSchema = z
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
    professionalSubcategoryIds: z.array(z.string().uuid()),
  })
  .refine((data) => data.isClient || data.isProfessional, {
    message: 'Selecciona al menos un rol: cliente o profesional',
    path: ['isClient'],
  })
  .refine((data) => !data.isProfessional || data.professionalSubcategoryIds.length > 0, {
    message: 'Agrega al menos un servicio que ofreces como profesional',
    path: ['professionalSubcategoryIds'],
  })
  .refine(
    (data) =>
      !data.isProfessional ||
      data.professionalSubcategoryIds.length <= PROFESSIONAL_SERVICE_SELECTION.max,
    {
      message: `Puedes seleccionar máximo ${PROFESSIONAL_SERVICE_SELECTION.max} servicios`,
      path: ['professionalSubcategoryIds'],
    },
  );

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
