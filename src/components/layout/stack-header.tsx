import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StackHeaderProps = {
  title: string;
  showBack?: boolean;
  /** Adds top safe-area padding for edge-to-edge screens */
  applyTopInset?: boolean;
};

export function StackHeader({ title, showBack = true, applyTopInset = false }: StackHeaderProps) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: theme.border,
          paddingTop: applyTopInset ? insets.top : 0,
        },
      ]}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={Spacing.sm}
          onPress={() => router.back()}
          style={styles.sideButton}>
          <AppIcon color={theme.text} name="chevron-back" size={24} />
        </Pressable>
      ) : (
        <View style={styles.sideButton} />
      )}
      <AppText numberOfLines={1} variant="bodyMedium" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.sideButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: Layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPaddingHorizontal,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sideButton: {
    width: 40,
    minHeight: Layout.minTouchTarget,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
