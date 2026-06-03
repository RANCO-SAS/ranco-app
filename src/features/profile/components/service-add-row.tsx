import { Pressable, StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { CategoryIcon } from '@/components/ui/category-icon';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ServiceAddRowProps = {
  title: string;
  subtitle: string;
  categorySlug: string;
  onAdd: () => void;
  disabled?: boolean;
  isLast?: boolean;
};

export function ServiceAddRow({
  title,
  subtitle,
  categorySlug,
  onAdd,
  disabled = false,
  isLast = false,
}: ServiceAddRowProps) {
  const theme = useTheme();

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onAdd}
      style={[
        styles.row,
        !isLast && {
          borderBottomColor: theme.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.backgroundElement }]}>
        <CategoryIcon color={theme.textSecondary} slug={categorySlug} size={20} />
      </View>

      <View style={styles.content}>
        <AppText numberOfLines={1} variant="bodyMedium">
          {title}
        </AppText>
        <AppText color="textMuted" numberOfLines={1} variant="small">
          {subtitle}
        </AppText>
      </View>

      <View style={[styles.addButton, { backgroundColor: theme.backgroundElement }]}>
        <AppIcon color={theme.text} name="add" size={20} />
      </View>
    </AnimatedPressable>
  );
}

type ServiceSuggestionPillProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function ServiceSuggestionPill({ label, onPress, disabled = false }: ServiceSuggestionPillProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.pill, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}>
      <AppText variant="caption">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
