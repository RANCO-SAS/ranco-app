import { create } from 'zustand';

import type { UserMode } from '@/types';

type AppStore = {
  activeMode: UserMode;
  setActiveMode: (mode: UserMode) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  activeMode: 'client',
  setActiveMode: (mode) => set({ activeMode: mode }),
}));
