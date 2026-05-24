import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'dark';
type ButtonSize = 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const styles = getVariantStyles(theme, variant);
  const height = size === 'lg' ? Layout.minTouchTarget + 4 : Layout.minTouchTarget;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        { minHeight: height, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        fullWidth && styles.fullWidth,
        style as ViewStyle,
      ]}
      {...rest}>
      <AppText
        variant="bodyMedium"
        color={styles.textColor}
        align="center">
        {label}
      </AppText>
    </Pressable>
  );
}

function getVariantStyles(
  theme: ReturnType<typeof useTheme>,
  variant: ButtonVariant,
): {
  container: ViewStyle;
  textColor: 'primaryForeground' | 'text' | 'primary' | 'destructive' | 'background';
  fullWidth: ViewStyle;
} {
  const base: ViewStyle = {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  };

  switch (variant) {
    case 'secondary':
      return {
        container: {
          ...base,
          backgroundColor: theme.backgroundElement,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
        },
        textColor: 'text',
        fullWidth: { alignSelf: 'stretch' },
      };
    case 'ghost':
      return {
        container: base,
        textColor: 'primary',
        fullWidth: { alignSelf: 'stretch' },
      };
    case 'destructive':
      return {
        container: { ...base, backgroundColor: theme.destructive },
        textColor: 'primaryForeground',
        fullWidth: { alignSelf: 'stretch' },
      };
    case 'dark':
      return {
        container: { ...base, backgroundColor: theme.text },
        textColor: 'background',
        fullWidth: { alignSelf: 'stretch' },
      };
    default:
      return {
        container: { ...base, backgroundColor: theme.primary },
        textColor: 'primaryForeground',
        fullWidth: { alignSelf: 'stretch' },
      };
  }
}
