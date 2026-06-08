import { useEffect } from 'react';

import { authService } from '@/features/auth/services/auth.service';
import { isApiConfigured } from '@/lib/env';
import { websocketClient } from '@/services/api/websocket-client';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';

export function useAuthInit() {
  const setSession = useAuthStore((state) => state.setSession);
  const setHydrated = useAuthStore((state) => state.setHydrated);
  const resetSessionState = useAppStore((state) => state.resetSessionState);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initializeAuth() {
      if (!isApiConfigured()) {
        setSession(null);
        setHydrated(true);
        return;
      }

      let isInitialized = false;

      try {
        unsubscribe = authService.onAuthStateChange((event, session) => {
          if (!isInitialized && event === 'INITIAL_SESSION') {
            return;
          }

          setSession(session);

          if (event === 'SIGNED_OUT') {
            resetSessionState();
            websocketClient.disconnect();
          }

          if (event === 'SIGNED_IN' && session) {
            void websocketClient.connect();
          }
        });

        const session = await authService.getValidatedSession();
        setSession(session);
        if (session) {
          void websocketClient.connect();
        } else {
          websocketClient.disconnect();
        }
        isInitialized = true;
      } catch {
        setSession(null);
        isInitialized = true;
      } finally {
        setHydrated(true);
      }
    }

    void initializeAuth();

    return () => {
      unsubscribe?.();
    };
  }, [resetSessionState, setHydrated, setSession]);
}
