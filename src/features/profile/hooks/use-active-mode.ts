import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { Routes } from '@/constants/routes';
import {
  isHybridUser,
  isModeAllowedForProfile,
  resolveActiveMode,
  shouldShowDiscoverTab,
  shouldShowJobsTab,
} from '@/features/profile/utils/user-mode';
import { selectActiveMode, useAppStore } from '@/stores/app-store';
import { selectProfile, useProfileStore } from '@/stores/profile-store';
import type { UserMode } from '@/types';

export function useActiveMode() {
  const router = useRouter();
  const profile = useProfileStore(selectProfile);
  const storedMode = useAppStore(selectActiveMode);
  const setActiveMode = useAppStore((state) => state.setActiveMode);

  const activeMode = useMemo(
    () => resolveActiveMode(profile, storedMode),
    [profile, storedMode],
  );

  const hybridUser = isHybridUser(profile);

  const switchMode = useCallback(
    (mode: UserMode) => {
      if (!profile || !isModeAllowedForProfile(profile, mode)) {
        return;
      }

      if (mode === activeMode) {
        return;
      }

      setActiveMode(mode);
      router.replace(Routes.app.home);
    },
    [activeMode, profile, router, setActiveMode],
  );

  return {
    activeMode,
    canSwitchMode: hybridUser,
    isHybridUser: hybridUser,
    showDiscoverTab: shouldShowDiscoverTab(profile, activeMode),
    showJobsTab: shouldShowJobsTab(profile, activeMode),
    switchMode,
  };
}
