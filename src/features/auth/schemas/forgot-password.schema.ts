import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.email('Ingresa un correo válido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
