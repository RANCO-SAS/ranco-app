import * as Linking from 'expo-linking';

import type { OAuthAuthProvider } from '@/features/auth/types/auth-provider.types';
import type { OAuthProviderId } from '@/features/auth/types/auth.types';
import { AuthError } from '@/features/auth/utils/map-auth-error';
import { getSupabaseClient } from '@/services/supabase/client';

async function signInWithOAuth(provider: OAuthProviderId): Promise<void> {
  const supabase = getSupabaseClient();
  const redirectTo = Linking.createURL('/');

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  throw new AuthError(
    'El inicio de sesión con proveedores externos estará disponible pronto.',
    'oauth_not_implemented',
  );
}

export const oauthAuthProvider: OAuthAuthProvider = {
  signInWithOAuth,
};
