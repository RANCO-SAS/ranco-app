import type { OAuthProviderId } from '@/features/auth/types/auth.types';

export type OAuthAuthProvider = {
  signInWithOAuth: (provider: OAuthProviderId) => Promise<void>;
};
