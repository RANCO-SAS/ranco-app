import { AuthLayout } from '@/components/layout/auth-layout';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { SocialAuthButtons } from '@/features/auth/components/social-auth-buttons';
import { useOAuthLogin } from '@/features/auth/hooks/use-oauth-login';
import type { OAuthProviderId } from '@/features/auth/types/auth.types';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';

export function LoginScreen() {
  const oauthLogin = useOAuthLogin();

  const handleOAuthPress = (provider: OAuthProviderId) => {
    oauthLogin.reset();
    oauthLogin.mutate(provider);
  };

  return (
    <ScreenLayout scrollable centered>
      <AuthLayout
        title="Ranco"
        subtitle="Conecta con profesionales cerca de ti">
        {oauthLogin.error ? (
          <AuthMessage message={mapAuthError(oauthLogin.error)} variant="error" />
        ) : null}

        <SocialAuthButtons
          disabled={oauthLogin.isPending}
          pendingProvider={oauthLogin.isPending ? oauthLogin.variables : null}
          onProviderPress={handleOAuthPress}
        />
      </AuthLayout>
    </ScreenLayout>
  );
}
