import { create } from 'zustand';

import type { AuthSession } from '@/features/auth/types/auth.types';

type AuthStore = {
  session: AuthSession | null;
  isHydrated: boolean;
  setSession: (session: AuthSession | null) => void;
  setHydrated: (value: boolean) => void;
  reset: () => void;
};

const initialState = {
  session: null as AuthSession | null,
  isHydrated: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  setSession: (session) => set({ session }),
  setHydrated: (value) => set({ isHydrated: value }),
  reset: () => set(initialState),
}));

export const selectAuthSession = (state: AuthStore) => state.session;
export const selectIsAuthenticated = (state: AuthStore) => state.session !== null;
export const selectIsHydrated = (state: AuthStore) => state.isHydrated;
