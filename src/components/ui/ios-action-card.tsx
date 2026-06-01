import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IosActionCardProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  featured?: boolean;
  compact?: boolean;
  onPress: () => void;
};

export function IosActionCard({
  title,
  subtitle,
  icon,
  featured = false,
  compact = false,
  onPress,
}: IosActionCardProps) {
  const theme = useTheme();

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        compact ? styles.compactCard : styles.featuredCard,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: featured ? theme.primary : theme.border,
          borderWidth: featured ? 1 : StyleSheet.hairlineWidth,
        },
      ]}>
      {featured ? (
        <>
          {icon ? (
            <View style={[styles.featuredIcon, { backgroundColor: `${theme.primary}18` }]}>
              {icon}
            </View>
          ) : null}
          <View style={styles.featuredContent}>
            <AppText numberOfLines={1} variant="subtitle">
              {title}
            </AppText>
            {subtitle ? (
              <AppText color="textSecondary" numberOfLines={2} variant="caption">
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </>
      ) : (
        <>
          {icon ? <View style={styles.compactIcon}>{icon}</View> : null}
          <View style={styles.compactContent}>
            <AppText numberOfLines={1} variant="bodyMedium">
              {title}
            </AppText>
          </View>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    width: '100%',
  },
  featuredCard: {
    flex: 1,
    minHeight: 168,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  compactCard: {
    flex: 1,
    minHeight: 76,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featuredIcon: {
    alignSelf: 'flex-start',
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredContent: {
    gap: Spacing.xs,
  },
  compactIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContent: {
    flex: 1,
    minWidth: 0,
  },
});
