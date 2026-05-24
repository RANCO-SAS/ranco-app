import { ActivityIndicator, StyleSheet, View, type ViewProps } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LoaderProps = ViewProps & {
  message?: string;
  size?: 'small' | 'large';
};

export function Loader({ message, size = 'large', style, ...rest }: LoaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]} {...rest}>
      <ActivityIndicator size={size} color={theme.primary} />
      {message ? (
        <AppText variant="caption" color="textSecondary" align="center">
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xxl,
  },
});
