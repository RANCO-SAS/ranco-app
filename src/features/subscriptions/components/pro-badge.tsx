import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { SubscriptionTargetRole } from '@/features/subscriptions/types/subscription';
import { useTheme } from '@/hooks/use-theme';

type ProBadgeProps = {
  variant: SubscriptionTargetRole;
  size?: 'sm' | 'md';
};

const COPY: Record<SubscriptionTargetRole, string> = {
  client: 'Cliente Pro',
  professional: 'Pro',
};

export function ProBadge({ variant, size = 'md' }: ProBadgeProps) {
  const theme = useTheme();
  const isSmall = size === 'sm';
  const iconName = variant === 'client' ? 'flash' : 'checkmark-circle';
  const label = COPY[variant];

  return (
    <View
      style={[
        styles.badge,
        isSmall ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: `${theme.primary}22` },
      ]}>
      <AppIcon color={theme.primary} name={iconName} size={isSmall ? 12 : 14} />
      <AppText color="primary" variant={isSmall ? 'small' : 'caption'}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  badgeSm: {
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  badgeMd: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
});
