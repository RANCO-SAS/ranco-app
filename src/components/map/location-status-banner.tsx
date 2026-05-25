import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { LocationAccessState } from '@/services/location/location.types';
import { useTheme } from '@/hooks/use-theme';

type LocationStatusBannerProps = {
  access: LocationAccessState;
  compact?: boolean;
  fallbackMessage?: string;
  onOpenSettings?: () => void;
  onRequestPermission?: () => void;
};

export function LocationStatusBanner({
  access,
  compact = false,
  fallbackMessage,
  onOpenSettings,
  onRequestPermission,
}: LocationStatusBannerProps) {
  const theme = useTheme();
  const message = access.message ?? fallbackMessage;

  if (!message || access.issue === 'none') {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        compact && styles.compact,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}>
      <AppText color="textSecondary" variant="caption">
        {message}
      </AppText>

      <View style={styles.actions}>
        {access.canRequestPermission && onRequestPermission ? (
          <Pressable accessibilityRole="button" onPress={onRequestPermission}>
            <AppText color="primary" variant="small">
              Permitir ubicación
            </AppText>
          </Pressable>
        ) : null}

        {access.canOpenSettings && onOpenSettings ? (
          <Pressable accessibilityRole="button" onPress={onOpenSettings}>
            <AppText color="primary" variant="small">
              Abrir ajustes
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  compact: {
    marginTop: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
