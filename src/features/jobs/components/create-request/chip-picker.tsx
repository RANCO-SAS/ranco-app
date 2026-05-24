import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipOption = {
  value: string;
  label: string;
};

type ChipPickerProps = {
  label: string;
  hint?: string;
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export function ChipPicker({
  label,
  hint,
  options,
  value,
  onChange,
  error,
  disabled,
}: ChipPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <AppText color="textSecondary" variant="label">
        {label}
      </AppText>
      {hint ? (
        <AppText color="textMuted" variant="caption">
          {hint}
        </AppText>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.chips}
        horizontal
        showsHorizontalScrollIndicator={false}>
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
                styles.chip,
                {
                  backgroundColor: selected ? theme.primary : theme.backgroundSecondary,
                  borderColor: selected ? theme.primary : theme.border,
                },
              ]}>
              <AppText color={selected ? 'primaryForeground' : 'text'} variant="bodyMedium">
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {error ? (
        <AppText color="destructive" variant="small">
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
  chips: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
});
