import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type UberListRowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  isLast?: boolean;
};

export function UberListRow({
  title,
  subtitle,
  leading,
  trailing,
  showChevron = true,
  onPress,
  isLast = false,
}: UberListRowProps) {
  const theme = useTheme();

  const row = (
    <View
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.border,
        },
      ]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.content}>
        <AppText numberOfLines={1} variant="bodyMedium">
          {title}
        </AppText>
        {subtitle ? (
          <AppText color="textSecondary" numberOfLines={2} variant="caption">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      {showChevron && onPress ? (
        <AppText color="textMuted" variant="body">
          ›
        </AppText>
      ) : null}
    </View>
  );

  if (!onPress) {
    return row;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {row}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: Layout.minTouchTarget + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  leading: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  trailing: {
    alignItems: 'flex-end',
  },
});
