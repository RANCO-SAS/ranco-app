import { create } from 'zustand';

import type { UserProfile } from '@/features/profile/types/profile.types';

type ProfileStore = {
  profile: UserProfile | null;
  isHydrated: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setHydrated: (value: boolean) => void;
  reset: () => void;
};

const initialState = {
  profile: null as UserProfile | null,
  isHydrated: false,
};

export const useProfileStore = create<ProfileStore>((set) => ({
  ...initialState,
  setProfile: (profile) => set({ profile }),
  setHydrated: (value) => set({ isHydrated: value }),
  reset: () => set(initialState),
}));

export const selectProfile = (state: ProfileStore) => state.profile;
export const selectIsProfileHydrated = (state: ProfileStore) => state.isHydrated;
export const selectIsOnboardingComplete = (state: ProfileStore) =>
  Boolean(state.profile?.onboardingCompletedAt);
export const selectNeedsOnboarding = (state: ProfileStore) =>
  !state.profile?.onboardingCompletedAt;
