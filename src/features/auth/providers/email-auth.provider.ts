import * as Linking from 'expo-linking';

import type {
  EmailAuthProvider,
  EmailCredentials,
  EmailSignUpParams,
} from '@/features/auth/types/auth-provider.types';
import type { AuthSession, AuthSignUpResult } from '@/features/auth/types/auth.types';
import { mapSupabaseSession } from '@/features/auth/services/session.mapper';
import { getSupabaseClient } from '@/services/supabase/client';

function getPasswordResetRedirectUrl(): string {
  return Linking.createURL('/(auth)/login');
}

async function signInWithEmail(credentials: EmailCredentials): Promise<AuthSession | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    throw error;
  }

  return mapSupabaseSession(data.session);
}

async function signUpWithEmail(params: EmailSignUpParams): Promise<AuthSignUpResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  return {
    session: mapSupabaseSession(data.session),
    requiresEmailConfirmation: !data.session && Boolean(data.user),
  };
}

async function resetPassword(email: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordResetRedirectUrl(),
  });

  if (error) {
    throw error;
  }
}

export const emailAuthProvider: EmailAuthProvider = {
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
};
