import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { Loader } from '@/components/ui/loader';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Routes } from '@/constants/routes';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { createSessionFromUrl } from '@/features/auth/utils/create-session-from-url';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { isSupabaseConfigured } from '@/lib/env';
import { authService } from '@/features/auth/services/auth.service';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const url = Linking.useLinkingURL();

  useEffect(() => {
    async function handleCallback(callbackUrl: string) {
      if (!isSupabaseConfigured()) {
        router.replace(Routes.auth.login);
        return;
      }

      const existingSession = await authService.getSession();

      if (existingSession) {
        router.replace(Routes.root);
        return;
      }

      try {
        await createSessionFromUrl(callbackUrl);
        router.replace(Routes.root);
      } catch (error) {
        setErrorMessage(mapAuthError(error));
      }
    }

    if (!url) {
      return;
    }

    void handleCallback(url);
  }, [router, url]);

  if (errorMessage) {
    return (
      <ScreenLayout centered scrollable>
        <AuthMessage message={errorMessage} variant="error" />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout centered>
      <Loader />
    </ScreenLayout>
  );
}
