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
  primaryVariant?: 'dark' | 'gradient' | 'primary';
  showBack?: boolean;
  onBackPress?: () => void;
  layout?: 'stacked' | 'split';
};

export function StickyFormFooter({
  primaryLabel,
  onPrimaryPress,
  primaryDisabled,
  primaryLoading,
  primaryVariant = 'dark',
  showBack,
  onBackPress,
  layout = 'stacked',
}: StickyFormFooterProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (layout === 'split') {
    return (
      <View
        style={[
          styles.splitContainer,
          {
            backgroundColor: theme.background,
            paddingBottom: Math.max(insets.bottom, Spacing.md),
          },
        ]}>
        {showBack ? (
          <View style={styles.splitButton}>
            <Button
              disabled={primaryLoading}
              fullWidth
              label="Atrás"
              onPress={onBackPress}
              size="md"
              variant="secondary"
            />
          </View>
        ) : null}
        <View style={styles.splitButton}>
          <Button
            disabled={primaryDisabled || primaryLoading}
            fullWidth
            label={primaryLabel}
            onPress={onPrimaryPress}
            size="md"
            variant={primaryVariant}
          />
        </View>
      </View>
    );
  }

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
        label={primaryLabel}
        onPress={onPrimaryPress}
        variant={primaryVariant}
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
  splitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.md,
  },
  splitButton: {
    flex: 1,
  },
});
