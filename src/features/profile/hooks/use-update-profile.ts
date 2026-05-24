import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateProfileFormData } from '@/features/profile/schemas/update-profile.schema';
import { profileService } from '@/features/profile/services/profile.service';
import { queryKeys } from '@/lib/query-keys';
import { useAppStore } from '@/stores/app-store';
import { useProfileStore } from '@/stores/profile-store';

type UpdateProfileVariables = UpdateProfileFormData & {
  userId: string;
};

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setProfile = useProfileStore((state) => state.setProfile);
  const syncActiveModeWithProfile = useAppStore((state) => state.syncActiveModeWithProfile);

  return useMutation({
    mutationFn: ({ userId, ...data }: UpdateProfileVariables) =>
      profileService.updateProfile(userId, {
        fullName: data.fullName,
        phone: data.phone || null,
        locationLabel: data.locationLabel || null,
        avatarUrl: data.avatarUrl || null,
      }),
    onSuccess: (profile) => {
      setProfile(profile);
      queryClient.setQueryData(queryKeys.profile.detail(profile.id), profile);
      syncActiveModeWithProfile(profile);
    },
  });
}
