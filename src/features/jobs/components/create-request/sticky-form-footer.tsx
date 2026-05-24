import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StickyFormFooterProps = {
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
};

export function StickyFormFooter({
  primaryLabel,
  onPrimaryPress,
  primaryDisabled,
  primaryLoading,
  showBack,
  onBackPress,
}: StickyFormFooterProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingBottom: Math.max(insets.bottom, Spacing.md),
        },
      ]}>
      {showBack ? (
        <Button
          disabled={primaryLoading}
          label="Atrás"
          onPress={onBackPress}
          variant="ghost"
        />
      ) : null}
      <Button
        disabled={primaryDisabled || primaryLoading}
        label={primaryLoading ? 'Publicando...' : primaryLabel}
        onPress={onPrimaryPress}
        variant="dark"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
});
