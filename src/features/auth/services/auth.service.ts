import type { AuthSession, OAuthProviderId } from '@/features/auth/types/auth.types';
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
  const supabase = getSupabaseClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event as AuthStateChangeEvent, mapSupabaseSession(session));
  });

  return () => {
    subscription.unsubscribe();
  };
}

export const authService = {
  getSession,
  signOut,
  onAuthStateChange,
  signInWithOAuth: (provider: OAuthProviderId) => oauthAuthProvider.signInWithOAuth(provider),
};

export type AuthService = typeof authService;
