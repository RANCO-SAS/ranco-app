import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo')
    .email('Ingresa un correo válido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
