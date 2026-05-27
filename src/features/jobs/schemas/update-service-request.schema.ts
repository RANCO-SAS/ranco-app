import { z } from 'zod';

import { createServiceRequestSchema } from '@/features/jobs/schemas/create-service-request.schema';

export const updateServiceRequestSchema = createServiceRequestSchema.pick({
  title: true,
  description: true,
  urgency: true,
  locationLabel: true,
});

export type UpdateServiceRequestFormData = z.infer<typeof updateServiceRequestSchema>;
