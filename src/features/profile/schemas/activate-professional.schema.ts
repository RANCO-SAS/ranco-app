import { z } from 'zod';

import { PROFESSIONAL_SERVICE_SELECTION } from '@/constants/profile';

export const activateProfessionalSchema = z.object({
  professionalSubcategoryIds: z
    .array(z.string().uuid())
    .min(
      PROFESSIONAL_SERVICE_SELECTION.min,
      `Elige al menos ${PROFESSIONAL_SERVICE_SELECTION.min} servicio`,
    )
    .max(
      PROFESSIONAL_SERVICE_SELECTION.max,
      `Puedes seleccionar máximo ${PROFESSIONAL_SERVICE_SELECTION.max} servicios`,
    ),
});

export type ActivateProfessionalFormData = z.infer<typeof activateProfessionalSchema>;
