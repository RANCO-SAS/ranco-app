import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import type { LoginFormData } from '@/features/auth/schemas/login.schema';
import { authService } from '@/features/auth/services/auth.service';
import { Routes } from '@/constants/routes';

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginFormData) =>
      authService.signInWithEmail({
        email: data.email,
        password: data.password,
      }),
    onSuccess: () => {
      router.replace(Routes.root);
    },
  });
}
