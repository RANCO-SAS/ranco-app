import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabScreenHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  trailing?: ReactNode;
};

export function TabScreenHeader({ title, subtitle, badge, trailing }: TabScreenHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderBottomColor: theme.border,
          marginHorizontal: -Layout.screenPaddingHorizontal,
        },
      ]}>
      <View style={styles.content}>
        <View style={styles.mainRow}>
          <View style={styles.textBlock}>
            <AppText variant="title">{title}</AppText>
            {subtitle ? (
              <AppText color="textSecondary" variant="caption">
                {subtitle}
              </AppText>
            ) : null}
          </View>

          <View style={styles.trailingBlock}>
            {badge ? (
              <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
                <View style={[styles.badgeDot, { backgroundColor: theme.primary }]} />
                <AppText style={styles.badgeText} variant="small">
                  {badge}
                </AppText>
              </View>
            ) : null}
            {trailing}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.lg,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: Spacing.md,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: Spacing.xs,
    minWidth: 0,
  },
  trailingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
