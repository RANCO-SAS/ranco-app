export type AuthSession = {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
};

export type OAuthProviderId = 'google' | 'apple';
