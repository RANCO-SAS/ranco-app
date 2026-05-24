import * as QueryParams from 'expo-auth-session/build/QueryParams';

import { AuthError } from '@/features/auth/utils/map-auth-error';
import { getSupabaseClient } from '@/services/supabase/client';

export async function createSessionFromUrl(url: string): Promise<void> {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new AuthError(`Error de autenticación: ${errorCode}`, errorCode);
  }

  const supabase = getSupabaseClient();
  const code = params.code;
  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (typeof code === 'string' && code.length > 0) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    return;
  }

  if (
    typeof accessToken === 'string' &&
    accessToken.length > 0 &&
    typeof refreshToken === 'string' &&
    refreshToken.length > 0
  ) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    return;
  }

  throw new AuthError('No se pudo completar el inicio de sesión.', 'oauth_session_missing');
}
