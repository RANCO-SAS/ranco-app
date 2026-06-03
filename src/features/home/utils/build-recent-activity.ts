import type { ColorScheme, Colors } from '@/constants/theme';
import type { AppNotification } from '@/features/notifications/types/notification.types';
import { getNotificationIconConfig } from '@/features/notifications/utils/notification-icon';
import { resolveNotificationRoute } from '@/features/notifications/utils/notification-route';
import type { RecentActivityItem } from '@/features/home/types/dashboard.types';
import { formatNotificationTime } from '@/shared/utils/format-notification-time';

type Theme = (typeof Colors)[ColorScheme];

export function buildRecentActivity(
  notifications: AppNotification[],
  theme: Theme,
  limit = 5,
): RecentActivityItem[] {
  return notifications.slice(0, limit).map((notification) => {
    const icon = getNotificationIconConfig(notification.type, theme);

    return {
      id: notification.id,
      title: notification.title,
      subtitle: notification.body.trim() || formatNotificationTime(notification.createdAt),
      icon: icon.name,
      iconBackground: icon.background,
      iconColor: icon.color,
      route: resolveNotificationRoute(notification),
    };
  });
}
