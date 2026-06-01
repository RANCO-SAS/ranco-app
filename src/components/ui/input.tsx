import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
};

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export function Input({
  label,
  error,
  showPasswordToggle = false,
  secureTextEntry,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const focusProgress = useSharedValue(0);

  const animatedInputStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [error ? theme.destructive : theme.border, error ? theme.destructive : theme.primary],
    ),
  }));

  const handleFocus: TextInputProps['onFocus'] = (event) => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: 180 });
    onFocus?.(event);
  };

  const handleBlur: TextInputProps['onBlur'] = (event) => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: 180 });
    onBlur?.(event);
  };

  const isSecure = Boolean(secureTextEntry && !isPasswordVisible);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="label" color={isFocused ? 'text' : 'textSecondary'} style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View style={styles.inputRow}>
        <AnimatedTextInput
          placeholderTextColor={theme.textMuted}
          secureTextEntry={isSecure}
          style={[
            styles.input,
            showPasswordToggle && styles.inputWithToggle,
            {
              backgroundColor: theme.backgroundSecondary,
              color: theme.text,
            },
            animatedInputStyle,
            style,
          ]}
          onBlur={handleBlur}
          onFocus={handleFocus}
          {...rest}
        />

        {showPasswordToggle && secureTextEntry ? (
          <Pressable
            accessibilityLabel={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            style={styles.toggleButton}>
            <AppIcon
              color={theme.textMuted}
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <AppText variant="small" color="destructive" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputRow: {
    position: 'relative',
  },
  input: {
    minHeight: Layout.minTouchTarget + 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  inputWithToggle: {
    paddingRight: Spacing.xxxl,
  },
  toggleButton: {
    position: 'absolute',
    right: Spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  error: {
    marginTop: Spacing.xs,
  },
});
