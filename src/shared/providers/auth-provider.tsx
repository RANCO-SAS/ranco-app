import type { ReactNode } from 'react';

import { AuthHydrationGate } from '@/features/auth/components/auth-hydration-gate';
import { useAuthInit } from '@/features/auth/hooks/use-auth-init';
import { useOAuthLinking } from '@/features/auth/hooks/use-oauth-linking';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  useAuthInit();
  useOAuthLinking();

  return <AuthHydrationGate>{children}</AuthHydrationGate>;
}
