import type { ReactNode } from 'react';

import { useAuthInit } from '@/features/auth/hooks/use-auth-init';
import { AuthHydrationGate } from '@/features/auth/components/auth-hydration-gate';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  useAuthInit();

  return <AuthHydrationGate>{children}</AuthHydrationGate>;
}
