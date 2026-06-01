import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PublicProfileStatCardProps = {
  label: string;
  value: string;
  suffix?: string;
  trailing?: ReactNode;
};

export function PublicProfileStatCard({
  label,
  value,
  suffix,
  trailing,
}: PublicProfileStatCardProps) {
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
      <AppText color="textSecondary" style={styles.label} variant="small">
        {label}
      </AppText>

      <View style={styles.valueRow}>
        <AppText style={[styles.value, { color: theme.primary }]} variant="title">
          {value}
        </AppText>
        {trailing}
      </View>

      {suffix ? (
        <AppText color="textSecondary" numberOfLines={2} variant="caption">
          {suffix}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    gap: Spacing.xs,
    minWidth: 0,
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
