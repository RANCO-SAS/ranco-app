import { useEffect } from 'react';

import { profileService } from '@/features/profile/services/profile.service';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAppStore } from '@/stores/app-store';
import { useProfileStore } from '@/stores/profile-store';

export function useProfileSync() {
  const { session, isAuthenticated, isHydrated: isAuthHydrated } = useAuth();
  const setProfile = useProfileStore((state) => state.setProfile);
  const setHydrated = useProfileStore((state) => state.setHydrated);
  const reset = useProfileStore((state) => state.reset);
  const setActiveMode = useAppStore((state) => state.setActiveMode);

  const userId = session?.userId;
  const profileQuery = useProfile(isAuthHydrated && isAuthenticated ? userId : undefined);

  useEffect(() => {
    if (!isAuthHydrated) {
      return;
    }

    if (!isAuthenticated || !userId) {
      reset();
      setHydrated(true);
      return;
    }

    if (!profileQuery.isFetched) {
      setHydrated(false);
      return;
    }

    async function syncProfile() {
      if (!userId) {
        return;
      }

      try {
        let profile = profileQuery.data ?? null;

        if (!profile) {
          profile = await profileService.initializeProfile({
            userId,
            fullName: session?.fullName,
            avatarUrl: session?.avatarUrl,
          });
        }

        setProfile(profile);

        if (profile.isClient) {
          setActiveMode('client');
        } else if (profile.isProfessional) {
          setActiveMode('professional');
        }
      } catch {
        setProfile(null);
      } finally {
        setHydrated(true);
      }
    }

    void syncProfile();
  }, [
    isAuthHydrated,
    isAuthenticated,
    userId,
    profileQuery.isFetched,
    profileQuery.data,
    reset,
    session?.fullName,
    session?.avatarUrl,
    setActiveMode,
    setHydrated,
    setProfile,
  ]);
}
