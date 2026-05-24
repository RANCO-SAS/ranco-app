import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Spacer } from '@/components/ui/spacer';
import type { OAuthProviderId } from '@/features/auth/types/auth.types';

type SocialAuthButtonsProps = {
  disabled?: boolean;
  pendingProvider?: OAuthProviderId | null;
  onProviderPress: (provider: OAuthProviderId) => void;
};

const PROVIDER_LABELS: Record<OAuthProviderId, string> = {
  google: 'Continuar con Google',
  apple: 'Continuar con Apple',
};

export function SocialAuthButtons({
  disabled = false,
  pendingProvider = null,
  onProviderPress,
}: SocialAuthButtonsProps) {
  return (
    <View>
      <Button
        disabled={disabled}
        label={
          pendingProvider === 'google' ? 'Conectando con Google...' : PROVIDER_LABELS.google
        }
        onPress={() => onProviderPress('google')}
      />

      <Spacer size="sm" />

      <Button
        disabled={disabled}
        label={pendingProvider === 'apple' ? 'Conectando con Apple...' : PROVIDER_LABELS.apple}
        onPress={() => onProviderPress('apple')}
        variant="secondary"
      />
    </View>
  );
}
