import { env } from '@/lib/env';
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
    throw new ApiError('API URL is not configured', 'configuration_error');
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
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    const payload = (await response.json()) as ApiResponse<ApiAuthResponse>;
    if (payload.status !== 'success' || !payload.data) {
      await setStoredTokens(null);
      return null;
    }

    await setStoredTokens({
      accessToken: payload.data.accessToken,
      refreshToken: payload.data.refreshToken,
      expiresAt: payload.data.expiresAt,
    });

    return payload.data.accessToken;
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

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;

  if (payload.status !== 'success') {
    throw new ApiError(payload.status_reason || 'Request failed', payload.status);
  }

  return payload.data as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, method = 'GET', body, formData } = options;
  const headers: Record<string, string> = {};

  if (auth) {
    const token = (await resolveAccessToken(true)) ?? (await getAccessToken());
    if (!token) {
      throw new ApiError('Authentication required', 'unauthorized');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && !formData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (response.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, options);
    }
    throw new ApiError('Session expired', 'unauthorized');
  }

  return parseResponse<T>(response);
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

export async function apiDelete<T>(path: string, auth = true): Promise<T> {
  return apiRequest<T>(path, { auth, method: 'DELETE' });
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return apiRequest<T>(path, { auth: true, method: 'POST', formData });
}

export async function apiPublicPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, { auth: false, method: 'POST', body });
}

export { setStoredTokens, getStoredTokens, refreshAccessToken };
