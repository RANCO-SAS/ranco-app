import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type UberActionCardProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  leading?: ReactNode;
};

export function UberActionCard({ title, subtitle, onPress, leading }: UberActionCardProps) {
  const theme = useTheme();

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.content}>
        <AppText variant="bodyMedium">{title}</AppText>
        {subtitle ? (
          <AppText color="textSecondary" variant="caption">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <AppIcon color={theme.textMuted} name="chevron-forward" size={18} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  leading: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
});
