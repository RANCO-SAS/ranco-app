import { StyleSheet, View, type ViewProps } from 'react-native';

import { LoadingAnimation } from '@/components/ui/loading-animation';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

const LOADER_SIZES = {
  small: 48,
  large: 120,
} as const;

type LoaderProps = ViewProps & {
  message?: string;
  size?: keyof typeof LOADER_SIZES;
  variant?: 'fullscreen' | 'inline';
};

export function Loader({
  message,
  size = 'large',
  variant = 'fullscreen',
  style,
  ...rest
}: LoaderProps) {
  return (
    <View
      style={[
        variant === 'fullscreen' ? styles.fullscreenContainer : styles.inlineContainer,
        style,
      ]}
      {...rest}>
      <LoadingAnimation size={LOADER_SIZES[size]} />
      {message ? (
        <AppText variant="caption" color="textSecondary" align="center">
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xxl,
  },
  inlineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
});
