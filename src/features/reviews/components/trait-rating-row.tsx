import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import type { ReviewTraitDefinition } from '@/features/reviews/constants/review-traits';
import { useTheme } from '@/hooks/use-theme';

type TraitRatingRowProps = {
  definition: ReviewTraitDefinition;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

export function TraitRatingRow({
  definition,
  value,
  onChange,
  disabled = false,
}: TraitRatingRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <AppText variant="bodyMedium">{definition.label}</AppText>
      <View style={styles.options}>
        {RATING_OPTIONS.map((option) => {
          const isSelected = value === option;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled }}
              disabled={disabled}
              onPress={() => onChange(option)}
              style={[
                styles.option,
                isSelected && { backgroundColor: theme.text },
              ]}>
              <AppText align="center" color={isSelected ? 'background' : 'text'} variant="small">
                {option}★
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  option: {
    minWidth: 44,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
  },
});
