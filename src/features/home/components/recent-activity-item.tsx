import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RecentActivityItemProps = {
  title: string;
  subtitle: string;
  icon: AppIconName;
  iconBackground: string;
  iconColor: string;
  route: Href | null;
  isLast?: boolean;
};

export function RecentActivityItemRow({
  title,
  subtitle,
  icon,
  iconBackground,
  iconColor,
  route,
  isLast = false,
}: RecentActivityItemProps) {
  const router = useRouter();
  const theme = useTheme();

  const handlePress = () => {
    if (route) {
      router.push(route);
    }
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={!route}
      onPress={handlePress}
      style={[
        styles.row,
        !isLast && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}>
      <View style={[styles.iconCircle, { backgroundColor: iconBackground }]}>
        <AppIcon color={iconColor} name={icon} size={18} />
      </View>

      <View style={styles.content}>
        <AppText numberOfLines={1} variant="bodyMedium">
          {title}
        </AppText>
        <AppText color="textSecondary" numberOfLines={1} variant="caption">
          {subtitle}
        </AppText>
      </View>

      {route ? <AppIcon color={theme.textMuted} name="chevron-forward" size={18} /> : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  iconCircle: {
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
});
