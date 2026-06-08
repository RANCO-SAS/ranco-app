import * as Linking from 'expo-linking';

import { AuthError } from '@/features/auth/utils/map-auth-error';
import { setStoredTokens } from '@/services/api/token-storage';
import { getStoredTokens } from '@/services/api/token-storage';

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

  const existingTokens = await getStoredTokens();

  if (existingTokens?.accessToken) {
    return;
  }

  const accessToken = getParam(params, 'access_token');
  const refreshToken = getParam(params, 'refresh_token');
  const expiresAtRaw = getParam(params, 'expires_at');

  if (accessToken && refreshToken) {
    await setStoredTokens({
      accessToken,
      refreshToken,
      expiresAt: expiresAtRaw ? Number(expiresAtRaw) : Date.now() + 3600_000,
    });
    return;
  }

  throw new AuthError('No se pudo completar la autenticación.', 'auth_session_missing');
}

export async function createSessionFromUrl(url: string): Promise<void> {
  if (!url.includes('access_token=') && url.includes('error=')) {
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
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const tokens = await getStoredTokens();

    if (tokens?.accessToken) {
      return tokens;
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
