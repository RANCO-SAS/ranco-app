import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { authService } from '@/features/auth/services/auth.service';
import type { SignUpInput } from '@/features/auth/types/auth.types';
import { Routes } from '@/constants/routes';

export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: SignUpInput) => authService.signUp(input),
    onSuccess: (session) => {
      if (session) {
        router.replace(Routes.root);
      }
    },
  });
}
