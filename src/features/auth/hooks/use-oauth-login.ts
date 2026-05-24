import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { authService } from '@/features/auth/services/auth.service';
import type { OAuthProviderId } from '@/features/auth/types/auth.types';
import { Routes } from '@/constants/routes';

export function useOAuthLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (provider: OAuthProviderId) => authService.signInWithOAuth(provider),
    onSuccess: () => {
      router.replace(Routes.root);
    },
  });
}
