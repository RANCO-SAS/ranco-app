import { useEffect } from 'react';

import { authService } from '@/features/auth/services/auth.service';
import { isSupabaseConfigured } from '@/lib/env';
import { useAuthStore } from '@/stores/auth-store';

export function useAuthInit() {
  const setSession = useAuthStore((state) => state.setSession);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initializeAuth() {
      if (!isSupabaseConfigured()) {
        setSession(null);
        setHydrated(true);
        return;
      }

      try {
        const session = await authService.getSession();
        setSession(session);
        unsubscribe = authService.onAuthStateChange(setSession);
      } catch {
        setSession(null);
      } finally {
        setHydrated(true);
      }
    }

    void initializeAuth();

    return () => {
      unsubscribe?.();
    };
  }, [setHydrated, setSession]);
}
