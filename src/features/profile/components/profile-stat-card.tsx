import { StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProfileStatCardProps = {
  label: string;
  value: string;
  trailingIcon?: AppIconName;
};

export function ProfileStatCard({ label, value, trailingIcon }: ProfileStatCardProps) {
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
      <View style={styles.valueRow}>
        <AppText style={{ color: theme.primary }} variant="subtitle">
          {value}
        </AppText>
        {trailingIcon ? <AppIcon color={theme.warning} name={trailingIcon} size={16} /> : null}
      </View>
      <AppText color="textMuted" style={styles.label} variant="small">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: {
    letterSpacing: 0.6,
    fontWeight: '600',
    textAlign: 'center',
  },
});
