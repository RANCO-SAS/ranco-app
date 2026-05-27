import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { authService } from '@/features/auth/services/auth.service';
import type { SignInInput } from '@/features/auth/types/auth.types';
import { Routes } from '@/constants/routes';

export function useSignIn() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: SignInInput) => authService.signInWithPassword(input),
    onSuccess: () => {
      router.replace(Routes.root);
    },
  });
}
