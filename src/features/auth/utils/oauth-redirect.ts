import Constants from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';

export const OAUTH_CALLBACK_PATH = 'auth/callback';

function shouldUseExpoGoRedirectUri(): boolean {
  const hostUri = Constants.expoConfig?.hostUri;

  return hostUri?.startsWith('exp://') ?? false;
}

export function getOAuthRedirectUri(): string {
  if (shouldUseExpoGoRedirectUri()) {
    return makeRedirectUri({
      path: OAUTH_CALLBACK_PATH,
    });
  }

  return makeRedirectUri({
    scheme: 'ranco',
    path: OAUTH_CALLBACK_PATH,
  });
}
