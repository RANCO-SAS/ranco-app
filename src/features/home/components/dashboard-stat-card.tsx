import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DashboardStatCardProps = {
  label: string;
  value: string;
  trailingIcon?: AppIconName;
  trailingIconColor?: string;
  trailing?: ReactNode;
};

export function DashboardStatCard({
  label,
  value,
  trailingIcon,
  trailingIconColor,
  trailing,
}: DashboardStatCardProps) {
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
      <AppText color="textMuted" style={styles.label} variant="small">
        {label}
      </AppText>

      <View style={styles.valueRow}>
        <AppText style={styles.value} variant="subtitle">
          {value}
        </AppText>
        {trailing}
        {trailingIcon ? (
          <AppIcon color={trailingIconColor ?? theme.warning} name={trailingIcon} size={18} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 132,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  label: {
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  value: {
    fontWeight: '700',
  },
});
