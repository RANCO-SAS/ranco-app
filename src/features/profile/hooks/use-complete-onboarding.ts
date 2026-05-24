import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import type { OnboardingFormData } from '@/features/profile/schemas/onboarding.schema';
import { profileService } from '@/features/profile/services/profile.service';
import { Routes } from '@/constants/routes';
import { queryKeys } from '@/lib/query-keys';
import { useAppStore } from '@/stores/app-store';
import { useProfileStore } from '@/stores/profile-store';

type CompleteOnboardingVariables = OnboardingFormData & {
  userId: string;
};

export function useCompleteOnboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setProfile = useProfileStore((state) => state.setProfile);
  const setActiveMode = useAppStore((state) => state.setActiveMode);

  return useMutation({
    mutationFn: ({ userId, ...data }: CompleteOnboardingVariables) =>
      profileService.completeOnboarding({
        userId,
        fullName: data.fullName,
        phone: data.phone,
        locationLabel: data.locationLabel,
        avatarUrl: data.avatarUrl || undefined,
        isClient: data.isClient,
        isProfessional: data.isProfessional,
      }),
    onSuccess: (profile) => {
      setProfile(profile);
      queryClient.setQueryData(queryKeys.profile.detail(profile.id), profile);

      if (profile.isClient) {
        setActiveMode('client');
      } else if (profile.isProfessional) {
        setActiveMode('professional');
      }

      router.replace(Routes.app.home);
    },
  });
}
