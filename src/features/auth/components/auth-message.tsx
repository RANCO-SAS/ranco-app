import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AuthMessageProps = {
  message: string;
  variant: 'error' | 'success';
};

export function AuthMessage({ message, variant }: AuthMessageProps) {
  const theme = useTheme();
  const isError = variant === 'error';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isError ? `${theme.destructive}15` : `${theme.success}15`,
          borderColor: isError ? theme.destructive : theme.success,
        },
      ]}>
      <AppText variant="caption" color={isError ? 'destructive' : 'success'}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
