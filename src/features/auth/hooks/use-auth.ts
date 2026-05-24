import { selectAuthSession, selectIsAuthenticated, selectIsHydrated, useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const session = useAuthStore(selectAuthSession);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore(selectIsHydrated);

  return {
    session,
    isAuthenticated,
    isHydrated,
  };
}
