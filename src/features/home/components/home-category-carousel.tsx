import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/ui/category-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { ServiceCategory } from '@/features/jobs/types/service-category.types';
import { useTheme } from '@/hooks/use-theme';

type HomeCategoryCarouselProps = {
  categories: ServiceCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
};

export function HomeCategoryCarousel({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: HomeCategoryCarouselProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <AppText variant="bodyMedium">Categorías</AppText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {categories.map((category) => {
            const isSelected = category.id === selectedCategoryId;

            return (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelectCategory(category.id)}
                style={[
                  styles.tile,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}>
                <View
                  style={[
                    styles.iconWrap,
                    {
                      backgroundColor: isSelected ? `${theme.primary}18` : theme.backgroundElement,
                    },
                  ]}>
                  <CategoryIcon slug={category.slug} size={24} />
                </View>
                <AppText align="center" numberOfLines={2} variant="caption">
                  {category.name}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  tile: {
    width: 96,
    minHeight: 108,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
