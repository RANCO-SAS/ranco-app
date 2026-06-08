import type { AppNotification, NotificationType } from '@/features/notifications/types/notification.types';
import { notificationRepository } from '@/repositories/notification.repository';

function mapApiNotification(notification: Awaited<ReturnType<typeof notificationRepository.getNotifications>>[number]): AppNotification {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type as NotificationType,
    title: notification.title,
    body: notification.body,
    data: (notification.data ?? {}) as AppNotification['data'],
    readAt: notification.readAt ?? null,
    createdAt: notification.createdAt,
  };
}

export const notificationService = {
  async getNotifications(_userId: string): Promise<AppNotification[]> {
    const data = await notificationRepository.getNotifications();
    return data.map(mapApiNotification);
  },

  async getUnreadCount(_userId: string): Promise<number> {
    const data = await notificationRepository.getUnreadCount();
    return data.count ?? 0;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await notificationRepository.markAsRead(notificationId);
  },

  async markAllAsRead(_userId: string): Promise<void> {
    await notificationRepository.markAllAsRead();
  },
};
