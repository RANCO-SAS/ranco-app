import type {
  AuthSession,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
} from '@/features/auth/types/auth.types';
import { authRepository, mapAuthResponse } from '@/repositories/auth.repository';
import { emitAuthStateChange, subscribeAuthStateChange } from '@/features/auth/utils/auth-events';
import { apiGet } from '@/services/api/client';
import {
  getStoredTokens,
  setStoredTokens,
  isTokenExpired,
} from '@/services/api/token-storage';
import type { UserProfile } from '@/features/profile/types/profile.types';

async function persistAuthResponse(response: Awaited<ReturnType<typeof authRepository.signIn>>): Promise<AuthSession> {
  await setStoredTokens({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: response.expiresAt,
  });

  const session = mapAuthResponse(response);
  emitAuthStateChange('SIGNED_IN', session);
  return session;
}

async function getSession(): Promise<AuthSession | null> {
  const tokens = await getStoredTokens();
  if (!tokens) {
    return null;
  }

  try {
    const profile = await apiGet<UserProfile>('/v1/app/profile/me');
    return {
      userId: profile.id,
      email: '',
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
    };
  } catch {
    return null;
  }
}

async function getValidatedSession(): Promise<AuthSession | null> {
  const tokens = await getStoredTokens();
  if (!tokens) {
    return null;
  }

  if (isTokenExpired(tokens.expiresAt)) {
    try {
      const response = await authRepository.refresh(tokens.refreshToken);
      return persistAuthResponse(response);
    } catch {
      await setStoredTokens(null);
      emitAuthStateChange('SIGNED_OUT', null);
      return null;
    }
  }

  return getSession();
}

async function signInWithPassword(input: SignInInput): Promise<AuthSession> {
  const response = await authRepository.signIn(input);
  return persistAuthResponse(response);
}

async function signUp(input: SignUpInput): Promise<AuthSession | null> {
  const response = await authRepository.signUp(input);
  return persistAuthResponse(response);
}

async function resetPasswordForEmail(_email: string): Promise<void> {
  throw new Error('Password reset is not available yet.');
}

async function updatePassword(_input: ResetPasswordInput): Promise<void> {
  throw new Error('Password update is not available yet.');
}

async function signOut(): Promise<void> {
  await setStoredTokens(null);
  emitAuthStateChange('SIGNED_OUT', null);
}

type AuthStateChangeEvent =
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY';

function onAuthStateChange(
  callback: (event: AuthStateChangeEvent, session: AuthSession | null) => void,
): () => void {
  return subscribeAuthStateChange(callback);
}

export const authService = {
  getSession,
  getValidatedSession,
  signInWithPassword,
  signUp,
  resetPasswordForEmail,
  updatePassword,
  signOut,
  onAuthStateChange,
};

export type AuthService = typeof authService;
