import { z } from 'zod';

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Ingresa tu nombre completo'),
    email: z.email('Ingresa un correo válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
