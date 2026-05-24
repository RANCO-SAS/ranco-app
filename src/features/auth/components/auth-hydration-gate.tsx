import type { ReactNode } from 'react';

import { Loader } from '@/components/ui/loader';
import { selectIsHydrated, useAuthStore } from '@/stores/auth-store';

type AuthHydrationGateProps = {
  children: ReactNode;
  message?: string;
};

export function AuthHydrationGate({ children, message = 'Cargando...' }: AuthHydrationGateProps) {
  const isHydrated = useAuthStore(selectIsHydrated);

  if (!isHydrated) {
    return <Loader message={message} />;
  }

  return children;
}
