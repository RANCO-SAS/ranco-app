import { useProfile } from '@/features/profile/hooks/use-profile';
import { selectProfile, useProfileStore } from '@/stores/profile-store';

export function useCurrentProfile() {
  const profile = useProfileStore(selectProfile);

  return {
    profile,
  };
}

export function useProfileQuery(userId: string | undefined) {
  return useProfile(userId);
}
