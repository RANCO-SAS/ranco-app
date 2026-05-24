import * as WebBrowser from 'expo-web-browser';

import type { OAuthAuthProvider } from '@/features/auth/types/auth-provider.types';
import type { OAuthProviderId } from '@/features/auth/types/auth.types';
import { createSessionFromUrl } from '@/features/auth/utils/create-session-from-url';
import { AuthError } from '@/features/auth/utils/map-auth-error';
import { getOAuthRedirectUri } from '@/features/auth/utils/oauth-redirect';
import { openOAuthSession } from '@/features/auth/utils/open-oauth-session';
import { getSupabaseClient } from '@/services/supabase/client';

WebBrowser.maybeCompleteAuthSession();

async function signInWithOAuth(provider: OAuthProviderId): Promise<void> {
  const supabase = getSupabaseClient();
  const redirectTo = getOAuthRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new AuthError('No se pudo iniciar el flujo OAuth.', 'oauth_url_missing');
  }

  if (__DEV__) {
    console.info('[oauth] redirectTo:', redirectTo);
  }

  const callbackUrl = await openOAuthSession(data.url, redirectTo);
  await createSessionFromUrl(callbackUrl);
}

export const oauthAuthProvider: OAuthAuthProvider = {
  signInWithOAuth,
};
