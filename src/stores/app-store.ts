import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserProfile } from '@/features/profile/types/profile.types';
import {
  isModeAllowedForProfile,
  resolveImplicitMode,
  isHybridUser,
} from '@/features/profile/utils/user-mode';
import type { UserMode } from '@/types';

type AppStore = {
  activeMode: UserMode;
  hasHydrated: boolean;
  pendingModeSelection: boolean;
  promptModeOnLogin: boolean;
  setActiveMode: (mode: UserMode) => void;
  setHasHydrated: (value: boolean) => void;
  setPendingModeSelection: (value: boolean) => void;
  setPromptModeOnLogin: (value: boolean) => void;
  syncActiveModeWithProfile: (profile: UserProfile) => void;
  syncModeSelectionPrompt: (profile: UserProfile) => void;
  clearModeSelectionPrompt: () => void;
  resetSessionState: () => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      activeMode: 'client',
      hasHydrated: false,
      pendingModeSelection: false,
      promptModeOnLogin: false,
      setActiveMode: (mode) => set({ activeMode: mode }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setPendingModeSelection: (value) => set({ pendingModeSelection: value }),
      setPromptModeOnLogin: (value) => set({ promptModeOnLogin: value }),
      clearModeSelectionPrompt: () =>
        set({
          pendingModeSelection: false,
          promptModeOnLogin: false,
        }),
      resetSessionState: () =>
        set({
          activeMode: 'client',
          pendingModeSelection: false,
          promptModeOnLogin: true,
        }),
      syncActiveModeWithProfile: (profile) => {
        if (!isHybridUser(profile)) {
          set({
            activeMode: resolveImplicitMode(profile),
            pendingModeSelection: false,
            promptModeOnLogin: false,
          });
          return;
        }

        const currentMode = get().activeMode;

        if (isModeAllowedForProfile(profile, currentMode)) {
          return;
        }

        set({ activeMode: 'client' });
      },
      syncModeSelectionPrompt: (profile) => {
        if (!get().promptModeOnLogin) {
          return;
        }

        if (isHybridUser(profile)) {
          set({ pendingModeSelection: true });
          return;
        }

        set({ promptModeOnLogin: false });
      },
    }),
    {
      name: 'ranco-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeMode: state.activeMode,
        promptModeOnLogin: state.promptModeOnLogin,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const selectActiveMode = (state: AppStore) => state.activeMode;
export const selectHasAppStoreHydrated = (state: AppStore) => state.hasHydrated;
export const selectPendingModeSelection = (state: AppStore) => state.pendingModeSelection;
