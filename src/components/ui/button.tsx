import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppText } from '@/components/ui/text';
import { ButtonGradients, Layout, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'dark' | 'gradient';
type ButtonSize = 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  style?: ViewStyle;
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
  const colorScheme = useColorScheme();
  const styles = getVariantStyles(theme, variant, size);
  const height = size === 'lg' ? Layout.minTouchTarget + 4 : Layout.minTouchTarget;
  const containerStyle = [
    styles.container,
    { minHeight: height, opacity: disabled ? 0.5 : 1 },
    fullWidth && styles.fullWidth,
    style,
  ];

  if (variant === 'gradient') {
    const gradientColors =
      colorScheme === 'dark' ? ButtonGradients.dark : ButtonGradients.light;

    return (
      <AnimatedPressable
        accessibilityRole="button"
        disabled={disabled}
        style={[fullWidth && styles.fullWidth, { opacity: disabled ? 0.5 : 1 }, style]}
        {...rest}>
        <LinearGradient
          colors={[...gradientColors]}
          end={{ x: 1, y: 0.5 }}
          start={{ x: 0, y: 0.5 }}
          style={[styles.container, { minHeight: height }]}>
          <AppText variant="bodyMedium" color="primaryForeground" align="center">
            {label}
          </AppText>
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      style={containerStyle}
      {...rest}>
      <AppText variant="bodyMedium" color={styles.textColor} align="center">
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

function getVariantStyles(
  theme: ReturnType<typeof useTheme>,
  variant: ButtonVariant,
  size: ButtonSize,
): {
  container: ViewStyle;
  textColor: 'primaryForeground' | 'text' | 'primary' | 'destructive' | 'background';
  fullWidth: ViewStyle;
} {
  const isPill = (variant === 'primary' || variant === 'gradient') && size === 'lg';

  const base: ViewStyle = {
    borderRadius: isPill ? Radius.full : Radius.md,
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
        container: { ...base, backgroundColor: theme.backgroundElement },
        textColor: 'text',
        fullWidth: { alignSelf: 'stretch' },
      };
    case 'gradient':
      return {
        container: base,
        textColor: 'primaryForeground',
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
