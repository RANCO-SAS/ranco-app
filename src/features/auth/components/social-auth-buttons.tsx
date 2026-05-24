import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { Spacer } from '@/components/ui/spacer';
import { Spacing } from '@/constants/theme';
import type { OAuthProviderId } from '@/features/auth/types/auth.types';
import { useTheme } from '@/hooks/use-theme';

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
  const theme = useTheme();

  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <AppText color="textMuted" variant="caption">
          o continúa con
        </AppText>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      <Spacer size="md" />

      <Button
        disabled={disabled}
        label={
          pendingProvider === 'google' ? 'Conectando con Google...' : PROVIDER_LABELS.google
        }
        onPress={() => onProviderPress('google')}
        variant="secondary"
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

const styles = StyleSheet.create({
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
