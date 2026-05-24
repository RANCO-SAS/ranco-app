import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { authService } from '@/features/auth/services/auth.service';
import { Routes } from '@/constants/routes';
import { useAppStore } from '@/stores/app-store';
import { useProfileStore } from '@/stores/profile-store';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resetProfile = useProfileStore((state) => state.reset);
  const resetSessionState = useAppStore((state) => state.resetSessionState);

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: async () => {
      resetProfile();
      resetSessionState();
      queryClient.clear();
      router.replace(Routes.auth.login);
    },
  });
}
