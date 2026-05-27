import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { authService } from '@/features/auth/services/auth.service';
import type { ResetPasswordInput } from '@/features/auth/types/auth.types';
import { Routes } from '@/constants/routes';

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authService.updatePassword(input),
    onSuccess: () => {
      router.replace(Routes.root);
    },
  });
}
