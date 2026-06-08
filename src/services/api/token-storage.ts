import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TokenPair } from '@/services/api/types';

const TOKEN_KEY = 'ranco.auth.tokens';

export async function getStoredTokens(): Promise<TokenPair | null> {
  const raw = await AsyncStorage.getItem(TOKEN_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TokenPair;
  } catch {
    return null;
  }
}

export async function setStoredTokens(tokens: TokenPair | null): Promise<void> {
  if (!tokens) {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }

  await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export async function getAccessToken(): Promise<string | null> {
  const tokens = await getStoredTokens();
  return tokens?.accessToken ?? null;
}

export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt * 1000 - 60_000;
}
