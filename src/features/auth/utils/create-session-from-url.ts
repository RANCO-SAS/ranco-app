import * as QueryParams from 'expo-auth-session/build/QueryParams';

import { AuthError } from '@/features/auth/utils/map-auth-error';
import { getSupabaseClient } from '@/services/supabase/client';

let exchangeInFlight: Promise<void> | null = null;

function getOAuthErrorCode(url: string, params: Record<string, string>): string | undefined {
  if (typeof params.error_code === 'string' && params.error_code.length > 0) {
    return params.error_code;
  }

  if (typeof params.error === 'string' && params.error.length > 0) {
    return params.error;
  }

  const { errorCode } = QueryParams.getQueryParams(url);

  return errorCode ?? undefined;
}

async function exchangeSessionFromUrl(url: string): Promise<void> {
  const { params } = QueryParams.getQueryParams(url);
  const oauthErrorCode = getOAuthErrorCode(url, params);

  if (oauthErrorCode) {
    throw new AuthError(`Error de autenticación: ${oauthErrorCode}`, oauthErrorCode);
  }

  const supabase = getSupabaseClient();
  const { data: existingSessionData } = await supabase.auth.getSession();

  if (existingSessionData.session) {
    return;
  }

  const code = params.code;
  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (typeof code === 'string' && code.length > 0) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      if (error.code === 'bad_oauth_state' || error.message.includes('OAuth state')) {
        const { data: retrySessionData } = await supabase.auth.getSession();

        if (retrySessionData.session) {
          return;
        }
      }

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

export async function createSessionFromUrl(url: string): Promise<void> {
  if (!url.includes('code=') && !url.includes('access_token=') && url.includes('error=')) {
    await exchangeSessionFromUrl(url);
    return;
  }

  if (!exchangeInFlight) {
    exchangeInFlight = exchangeSessionFromUrl(url).finally(() => {
      exchangeInFlight = null;
    });
  }

  await exchangeInFlight;
}

export async function waitForAuthSession(timeoutMs = 8000, intervalMs = 250) {
  const supabase = getSupabaseClient();
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      return data.session;
    }

    if (Date.now() >= deadline) {
      break;
    }

    await new Promise<void>((resolve) => {
      setTimeout(resolve, intervalMs);
    });
  }

  return null;
}
