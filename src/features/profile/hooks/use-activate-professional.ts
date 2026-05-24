import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ActivateProfessionalFormData } from '@/features/profile/schemas/activate-professional.schema';
import { profileService } from '@/features/profile/services/profile.service';
import { queryKeys } from '@/lib/query-keys';
import { useAppStore } from '@/stores/app-store';
import { useProfileStore } from '@/stores/profile-store';

type ActivateProfessionalVariables = ActivateProfessionalFormData & {
  userId: string;
  isClient: boolean;
};

export function useActivateProfessional() {
  const queryClient = useQueryClient();
  const setProfile = useProfileStore((state) => state.setProfile);
  const syncActiveModeWithProfile = useAppStore((state) => state.syncActiveModeWithProfile);

  return useMutation({
    mutationFn: ({ userId, isClient, professionalSubcategoryIds }: ActivateProfessionalVariables) =>
      profileService.updateProfile(userId, {
        isClient,
        isProfessional: true,
        professionalSubcategoryIds,
      }),
    onSuccess: (profile) => {
      setProfile(profile);
      queryClient.setQueryData(queryKeys.profile.detail(profile.id), profile);
      syncActiveModeWithProfile(profile);
    },
  });
}
