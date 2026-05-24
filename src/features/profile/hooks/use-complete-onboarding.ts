import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import type { OnboardingFormData } from '@/features/profile/schemas/onboarding.schema';
import { profileService } from '@/features/profile/services/profile.service';
import { Routes } from '@/constants/routes';
import { queryKeys } from '@/lib/query-keys';
import { isHybridUser } from '@/features/profile/utils/user-mode';
import { useAppStore } from '@/stores/app-store';
import { useProfileStore } from '@/stores/profile-store';

type CompleteOnboardingVariables = OnboardingFormData & {
  userId: string;
};

export function useCompleteOnboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setProfile = useProfileStore((state) => state.setProfile);
  const syncActiveModeWithProfile = useAppStore((state) => state.syncActiveModeWithProfile);
  const setPendingModeSelection = useAppStore((state) => state.setPendingModeSelection);
  const setPromptModeOnLogin = useAppStore((state) => state.setPromptModeOnLogin);

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
        professionalSubcategoryIds: data.professionalSubcategoryIds,
      }),
    onSuccess: (profile) => {
      setProfile(profile);
      queryClient.setQueryData(queryKeys.profile.detail(profile.id), profile);
      syncActiveModeWithProfile(profile);

      if (isHybridUser(profile)) {
        setPendingModeSelection(true);
        setPromptModeOnLogin(true);
      }

      router.replace(Routes.app.home);
    },
  });
}
