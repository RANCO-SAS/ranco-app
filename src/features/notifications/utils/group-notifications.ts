import type { AppNotification } from '@/features/notifications/types/notification.types';

export type NotificationTimeGroup = 'today' | 'yesterday' | 'this_month' | 'earlier';

const GROUP_ORDER: NotificationTimeGroup[] = ['today', 'yesterday', 'this_month', 'earlier'];

export const NOTIFICATION_GROUP_LABELS: Record<NotificationTimeGroup, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  this_month: 'Este mes',
  earlier: 'Anteriores',
};

export function getNotificationTimeGroup(isoDate: string): NotificationTimeGroup {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return 'earlier';
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return 'today';
  }

  if (diffDays === 1) {
    return 'yesterday';
  }

  if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return 'this_month';
  }

  return 'earlier';
}

export type NotificationGroup = {
  key: NotificationTimeGroup;
  label: string;
  items: AppNotification[];
};

export function groupNotificationsByTime(notifications: AppNotification[]): NotificationGroup[] {
  const grouped = new Map<NotificationTimeGroup, AppNotification[]>();

  for (const notification of notifications) {
    const group = getNotificationTimeGroup(notification.createdAt);
    const current = grouped.get(group) ?? [];
    current.push(notification);
    grouped.set(group, current);
  }

  return GROUP_ORDER.filter((key) => grouped.has(key)).map((key) => ({
    key,
    label: NOTIFICATION_GROUP_LABELS[key],
    items: grouped.get(key) ?? [],
  }));
}
