export type AuthSession = {
  userId: string;
  email: string;
  fullName: string | null;
};

export type AuthSignUpResult = {
  session: AuthSession | null;
  requiresEmailConfirmation: boolean;
};

export type OAuthProviderId = 'google' | 'apple';
