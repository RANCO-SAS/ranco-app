import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import type { ServiceCategory } from '@/features/jobs/types/service-category.types';
import { CategoryIcon } from '@/components/ui/category-icon';
import { useTheme } from '@/hooks/use-theme';

type CategoryGridPickerProps = {
  categories: ServiceCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  error?: string;
  disabled?: boolean;
};

export function CategoryGridPicker({
  categories,
  value,
  onChange,
  error,
  disabled,
}: CategoryGridPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        ¿Qué tipo de servicio necesitas?
      </AppText>
      <AppText variant="caption" color="textMuted">
        Elige la categoría que mejor encaje. Después podrás afinar con una subcategoría.
      </AppText>

      <View style={styles.grid}>
        {categories.map((category) => {
          const selected = value === category.id;

          return (
            <Pressable
              key={category.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(category.id)}
              style={[
                styles.card,
                {
                  backgroundColor: selected ? `${theme.primary}14` : theme.backgroundSecondary,
                  borderColor: selected ? theme.primary : theme.border,
                },
              ]}>
              <CategoryIcon slug={category.slug} />
              <AppText align="center" variant="bodyMedium">
                {category.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  card: {
    width: '47%',
    minHeight: Layout.minTouchTarget + 36,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 28,
    lineHeight: 32,
  },
});
