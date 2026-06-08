import { env } from '@/lib/env';
import { devError, devLog } from '@/lib/dev-logger';
import { keysToCamelCase, keysToSnakeCase } from '@/services/api/case-transform';
import { ApiError } from '@/services/api/errors';
import {
  getAccessToken,
  getStoredTokens,
  isTokenExpired,
  setStoredTokens,
} from '@/services/api/token-storage';
import type { ApiAuthResponse, ApiResponse } from '@/services/api/types';

type RequestOptions = {
  auth?: boolean;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  formData?: FormData;
};

let refreshPromise: Promise<string | null> | null = null;

function getBaseUrl(): string {
  const base = env.apiUrl.replace(/\/$/, '');
  if (!base) {
    throw new ApiError('La app no está configurada correctamente.', 'configuration_error');
  }
  return base;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const tokens = await getStoredTokens();
    if (!tokens?.refreshToken) {
      return null;
    }

    const response = await fetch(`${getBaseUrl()}/v1/app/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keysToSnakeCase({ refreshToken: tokens.refreshToken })),
    });

    const payload = (await response.json()) as ApiResponse<Record<string, unknown>>;
    if (payload.status !== 'success' || !payload.data) {
      await setStoredTokens(null);
      return null;
    }

    const data = keysToCamelCase(payload.data) as ApiAuthResponse;

    await setStoredTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
    });

    return data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function resolveAccessToken(auth: boolean): Promise<string | null> {
  if (!auth) {
    return null;
  }

  const tokens = await getStoredTokens();
  if (!tokens) {
    return null;
  }

  if (isTokenExpired(tokens.expiresAt)) {
    return refreshAccessToken();
  }

  return tokens.accessToken;
}

async function parseResponse<T>(response: Response, method: string, path: string, startedAt: number): Promise<T> {
  const payload = (await response.json()) as ApiResponse<Record<string, unknown>>;

  if (__DEV__) {
    devLog('api', `${method} ${path} ${response.status} ${Date.now() - startedAt}ms`);
  }

  if (payload.status !== 'success') {
    if (__DEV__) {
      devError('api', `${method} ${path} failed`, undefined, {
        code: payload.status,
        statusReason: payload.status_reason,
      });
    }
    throw new ApiError(
      payload.status_reason || 'Ocurrió un error inesperado. Inténtalo de nuevo.',
      payload.status,
    );
  }

  return keysToCamelCase(payload.data) as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, method = 'GET', body, formData } = options;
  const headers: Record<string, string> = {};
  const startedAt = Date.now();

  if (auth) {
    const token = (await resolveAccessToken(true)) ?? (await getAccessToken());
    if (!token) {
      throw new ApiError('Debes iniciar sesión para continuar.', 'unauthorized');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && !formData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body:
      formData ??
      (body !== undefined ? JSON.stringify(keysToSnakeCase(body)) : undefined),
  });

  if (response.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, options);
    }
    throw new ApiError('Tu sesión expiró. Inicia sesión de nuevo.', 'unauthorized');
  }

  return parseResponse<T>(response, method, path, startedAt);
}

export async function apiGet<T>(path: string, auth = true): Promise<T> {
  return apiRequest<T>(path, { auth, method: 'GET' });
}

export async function apiPost<T>(path: string, body?: unknown, auth = true): Promise<T> {
  return apiRequest<T>(path, { auth, method: 'POST', body });
}

export async function apiPatch<T>(path: string, body?: unknown, auth = true): Promise<T> {
  return apiRequest<T>(path, { auth, method: 'PATCH', body });
}

export async function apiPut<T>(path: string, body?: unknown, auth = true): Promise<T> {
  return apiRequest<T>(path, { auth, method: 'PUT', body });
}

export async function apiDelete<T>(
  path: string,
  auth = true,
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, { auth, method: 'DELETE', body });
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return apiRequest<T>(path, { auth: true, method: 'POST', formData });
}

export async function apiPublicPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, { auth: false, method: 'POST', body });
}

export { setStoredTokens, getStoredTokens, refreshAccessToken };
