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
  const syncActiveModeWithProfile = useAppStore((state) => state.syncActiveModeWithProfile);
  const syncModeSelectionPrompt = useAppStore((state) => state.syncModeSelectionPrompt);
  const hasAppStoreHydrated = useAppStore((state) => state.hasHydrated);

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

        if (hasAppStoreHydrated) {
          syncActiveModeWithProfile(profile);
          syncModeSelectionPrompt(profile);
        }
      } catch {
        setProfile(null);
      } finally {
        setHydrated(true);
      }
    }

    void syncProfile();
  }, [
    hasAppStoreHydrated,
    isAuthHydrated,
    isAuthenticated,
    userId,
    profileQuery.isFetched,
    profileQuery.data,
    reset,
    session?.fullName,
    session?.avatarUrl,
    setHydrated,
    setProfile,
    syncActiveModeWithProfile,
    syncModeSelectionPrompt,
  ]);

  useEffect(() => {
    if (!hasAppStoreHydrated || !isAuthenticated) {
      return;
    }

    const profile = useProfileStore.getState().profile;

    if (profile) {
      syncActiveModeWithProfile(profile);
    }
  }, [hasAppStoreHydrated, isAuthenticated, syncActiveModeWithProfile]);
}
