import { z } from 'zod';

import { PROFESSIONAL_SERVICE_SELECTION } from '@/constants/profile';

export const onboardingSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Ingresa tu nombre completo'),
    phone: z.string().trim().optional().or(z.literal('')),
    locationLabel: z.string().trim().optional().or(z.literal('')),
    avatarUrl: z.string().optional().or(z.literal('')),
    isClient: z.boolean(),
    isProfessional: z.boolean(),
    professionalSubcategoryIds: z.array(z.string().uuid()),
  })
  .refine((data) => data.isClient || data.isProfessional, {
    message: 'Elige al menos una forma de usar Ranco',
    path: ['isClient'],
  })
  .refine((data) => !data.isProfessional || data.professionalSubcategoryIds.length > 0, {
    message: 'Elige al menos un servicio que ofreces',
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

export const ONBOARDING_PROFILE_FIELDS = ['fullName', 'phone', 'locationLabel', 'avatarUrl'] as const;

export const ONBOARDING_ROLE_FIELDS = ['isClient', 'isProfessional'] as const;

export const ONBOARDING_SERVICES_FIELDS = ['professionalSubcategoryIds'] as const;
