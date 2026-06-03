import type { AppIconName } from '@/components/ui/app-icon';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export type ProfileMenuItem = {
  key: string;
  icon: AppIconName;
  label: string;
  onPress: () => void;
};

type ProfileMenuListProps = {
  items: ProfileMenuItem[];
};

export function ProfileMenuList({ items }: ProfileMenuListProps) {
  const theme = useTheme();

  if (items.length === 0) {
    return null;
  }

  return (
    <Card padded={false}>
      {items.map((item, index) => (
        <AnimatedPressable
          key={item.key}
          accessibilityRole="button"
          onPress={item.onPress}
          style={[
            styles.row,
            index < items.length - 1 && {
              borderBottomColor: theme.border,
              borderBottomWidth: StyleSheet.hairlineWidth,
            },
          ]}>
          <View style={[styles.iconWrap, { backgroundColor: theme.backgroundElement }]}>
            <AppIcon color={theme.textSecondary} name={item.icon} size={18} />
          </View>
          <AppText style={styles.label} variant="bodyMedium">
            {item.label}
          </AppText>
          <AppIcon color={theme.textMuted} name="chevron-forward" size={18} />
        </AnimatedPressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
