import type { AuthSession, AuthSignUpResult, OAuthProviderId } from '@/features/auth/types/auth.types';

export type EmailCredentials = {
  email: string;
  password: string;
};

export type EmailSignUpParams = EmailCredentials & {
  fullName: string;
};

export type EmailAuthProvider = {
  signInWithEmail: (credentials: EmailCredentials) => Promise<AuthSession | null>;
  signUpWithEmail: (params: EmailSignUpParams) => Promise<AuthSignUpResult>;
  resetPassword: (email: string) => Promise<void>;
};

export type OAuthAuthProvider = {
  signInWithOAuth: (provider: OAuthProviderId) => Promise<void>;
};
