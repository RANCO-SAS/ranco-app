import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText } from '@/components/ui/text';
import { Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StackHeaderProps = {
  title: string;
  showBack?: boolean;
};

export function StackHeader({ title, showBack = true }: StackHeaderProps) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={Spacing.sm}
          onPress={() => router.back()}
          style={styles.backButton}>
          <AppText variant="bodyMedium" color="primary">
            Volver
          </AppText>
        </Pressable>
      ) : (
        <View style={styles.backButton} />
      )}
      <AppText variant="bodyMedium" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.backButton} />
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
  backButton: {
    minWidth: 64,
    minHeight: Layout.minTouchTarget,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
