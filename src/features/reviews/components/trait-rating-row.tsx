import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
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
      <AppText numberOfLines={2} style={styles.label} variant="body">
        {definition.label}
      </AppText>

      <View style={styles.stars}>
        {RATING_OPTIONS.map((option) => {
          const isFilled = option <= value;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: isFilled, disabled }}
              disabled={disabled}
              hitSlop={4}
              onPress={() => onChange(option)}
              style={styles.starButton}>
              <AppIcon
                color={isFilled ? theme.primary : theme.border}
                name="star"
                size={22}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  label: {
    flex: 1,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starButton: {
    padding: 2,
  },
});
