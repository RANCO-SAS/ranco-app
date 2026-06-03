import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/ui/category-icon';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ActiveServiceCardProps = {
  title: string;
  subtitle: string;
  categorySlug: string;
  onRemove: () => void;
  disabled?: boolean;
};

export function ActiveServiceCard({
  title,
  subtitle,
  categorySlug,
  onRemove,
  disabled = false,
}: ActiveServiceCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: `${theme.primary}18` }]}>
        <CategoryIcon slug={categorySlug} size={22} />
      </View>

      <View style={styles.content}>
        <AppText numberOfLines={1} variant="bodyMedium">
          {title}
        </AppText>
        <AppText color="textSecondary" numberOfLines={1} variant="caption">
          {subtitle}
        </AppText>
      </View>

      <Pressable
        accessibilityLabel={`Quitar ${title}`}
        accessibilityRole="button"
        disabled={disabled}
        hitSlop={Spacing.sm}
        onPress={onRemove}
        style={[styles.removeButton, { backgroundColor: theme.backgroundElement }]}>
        <AppIcon color={theme.textSecondary} name="close" size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
