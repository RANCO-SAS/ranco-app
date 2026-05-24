import type { ReactNode } from 'react';

import { AuthHydrationGate } from '@/features/auth/components/auth-hydration-gate';
import { useAuthInit } from '@/features/auth/hooks/use-auth-init';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  useAuthInit();

  return <AuthHydrationGate>{children}</AuthHydrationGate>;
}
