import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OptionGroupProps<T extends string> = {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T | '';
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
};

export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  disabled,
}: OptionGroupProps<T>) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        {label}
      </AppText>
      <View style={styles.options}>
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? `${theme.primary}12` : theme.backgroundSecondary,
                  borderColor: selected ? theme.primary : theme.border,
                },
              ]}>
              <AppText variant="bodyMedium">{option.label}</AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <AppText variant="small" color="destructive">
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
  options: {
    gap: Spacing.sm,
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
