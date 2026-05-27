import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo')
    .email('Ingresa un correo válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
