import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import type { RegisterFormData } from '@/features/auth/schemas/register.schema';
import { authService } from '@/features/auth/services/auth.service';
import { Routes } from '@/constants/routes';

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterFormData) =>
      authService.signUpWithEmail({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      }),
    onSuccess: (result) => {
      if (result.requiresEmailConfirmation) {
        return;
      }

      router.replace(Routes.root);
    },
  });
}
