import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { getNotificationIconConfig } from '@/features/notifications/utils/notification-icon';
import type { AppNotification } from '@/features/notifications/types/notification.types';
import { formatNotificationTime } from '@/shared/utils/format-notification-time';
import { useTheme } from '@/hooks/use-theme';

type NotificationListItemProps = {
  notification: AppNotification;
  onPress: () => void;
};

export function NotificationListItem({ notification, onPress }: NotificationListItemProps) {
  const theme = useTheme();
  const icon = getNotificationIconConfig(notification.type, theme);
  const isUnread = !notification.readAt;

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
      <View style={styles.iconWrap}>
        <View style={[styles.iconCircle, { backgroundColor: icon.background }]}>
          <AppIcon color={icon.color} name={icon.name} size={20} />
        </View>
        {isUnread ? (
          <View
            style={[
              styles.unreadDot,
              {
                backgroundColor: theme.primary,
                borderColor: theme.backgroundSecondary,
              },
            ]}
          />
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText numberOfLines={1} style={styles.title} variant="bodyMedium">
            {notification.title}
          </AppText>
          <AppText color="textMuted" variant="small">
            {formatNotificationTime(notification.createdAt)}
          </AppText>
        </View>

        <AppText color="textSecondary" numberOfLines={2} variant="caption">
          {notification.body}
        </AppText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  iconWrap: {
    position: 'relative',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    borderWidth: 2,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },
});
