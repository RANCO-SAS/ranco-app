import type { EmailCredentials, EmailSignUpParams } from '@/features/auth/types/auth-provider.types';
import type { AuthSession, AuthSignUpResult, OAuthProviderId } from '@/features/auth/types/auth.types';
import { emailAuthProvider } from '@/features/auth/providers/email-auth.provider';
import { oauthAuthProvider } from '@/features/auth/providers/oauth-auth.provider';
import { mapSupabaseSession } from '@/features/auth/services/session.mapper';
import { getSupabaseClient } from '@/services/supabase/client';

async function getSession(): Promise<AuthSession | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return mapSupabaseSession(data.session);
}

async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

function onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
  const supabase = getSupabaseClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(mapSupabaseSession(session));
  });

  return () => {
    subscription.unsubscribe();
  };
}

export const authService = {
  getSession,
  signOut,
  onAuthStateChange,
  signInWithEmail: (credentials: EmailCredentials) => emailAuthProvider.signInWithEmail(credentials),
  signUpWithEmail: (params: EmailSignUpParams) => emailAuthProvider.signUpWithEmail(params),
  resetPassword: (email: string) => emailAuthProvider.resetPassword(email),
  signInWithOAuth: (provider: OAuthProviderId) => oauthAuthProvider.signInWithOAuth(provider),
};

export type AuthService = typeof authService;

export type AuthSignUpResultType = AuthSignUpResult;
