import * as Linking from 'expo-linking';

import { AuthError } from '@/features/auth/utils/map-auth-error';
import { getSupabaseClient } from '@/services/supabase/client';

let exchangeInFlight: Promise<void> | null = null;

function getParam(params: Linking.QueryParams, key: string): string | undefined {
  const value = params[key];

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
    return value[0];
  }

  return undefined;
}

function getAuthErrorCode(params: Linking.QueryParams): string | undefined {
  return getParam(params, 'error_code') ?? getParam(params, 'error');
}

async function exchangeSessionFromUrl(url: string): Promise<void> {
  const { queryParams } = Linking.parse(url);
  const params = queryParams ?? {};
  const authErrorCode = getAuthErrorCode(params);

  if (authErrorCode) {
    throw new AuthError(`Error de autenticación: ${authErrorCode}`, authErrorCode);
  }

  const supabase = getSupabaseClient();
  const { data: existingSessionData } = await supabase.auth.getSession();

  if (existingSessionData.session) {
    return;
  }

  const code = getParam(params, 'code');
  const accessToken = getParam(params, 'access_token');
  const refreshToken = getParam(params, 'refresh_token');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    return;
  }

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }

    return;
  }

  throw new AuthError('No se pudo completar la autenticación.', 'auth_session_missing');
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
