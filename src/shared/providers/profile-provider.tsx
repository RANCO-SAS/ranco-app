import type { ReactNode } from 'react';

import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileSync } from '@/features/profile/hooks/use-profile-sync';
import { selectIsProfileHydrated, useProfileStore } from '@/stores/profile-store';

type ProfileHydrationGateProps = {
  children: ReactNode;
  message?: string;
};

export function ProfileHydrationGate({
  children,
  message = 'Cargando perfil...',
}: ProfileHydrationGateProps) {
  const { isAuthenticated } = useAuth();
  const isProfileHydrated = useProfileStore(selectIsProfileHydrated);

  if (isAuthenticated && !isProfileHydrated) {
    return <Loader message={message} />;
  }

  return children;
}

type ProfileProviderProps = {
  children: ReactNode;
};

export function ProfileProvider({ children }: ProfileProviderProps) {
  useProfileSync();

  return <ProfileHydrationGate>{children}</ProfileHydrationGate>;
}
