import type {
  AuthSession,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
} from '@/features/auth/types/auth.types';
import { getPasswordResetRedirectUri } from '@/features/auth/utils/auth-redirect';
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

async function signInWithPassword(input: SignInInput): Promise<AuthSession> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });

  if (error) {
    throw error;
  }

  const session = mapSupabaseSession(data.session);

  if (!session) {
    throw new Error('No se pudo iniciar sesión.');
  }

  return session;
}

async function signUp(input: SignUpInput): Promise<AuthSession | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
      },
    },
  });

  if (error) {
    throw error;
  }

  return mapSupabaseSession(data.session);
}

async function resetPasswordForEmail(email: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getPasswordResetRedirectUri(),
  });

  if (error) {
    throw error;
  }
}

async function updatePassword(input: ResetPasswordInput): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password: input.password,
  });

  if (error) {
    throw error;
  }
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
  signInWithPassword,
  signUp,
  resetPasswordForEmail,
  updatePassword,
  signOut,
  onAuthStateChange,
};

export type AuthService = typeof authService;
