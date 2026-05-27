import type {
  AppNotification,
  NotificationData,
  NotificationType,
} from '@/features/notifications/types/notification.types';

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData | null;
  read_at: string | null;
  created_at: string;
};

export function mapNotificationRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    data: row.data ?? {},
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}
