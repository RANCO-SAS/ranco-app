import { apiGet, apiPost } from '@/services/api/client';

export type ApiNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
};

export const notificationRepository = {
  getNotifications() {
    return apiGet<ApiNotification[]>('/v1/app/notifications');
  },

  getUnreadCount() {
    return apiGet<{ count: number }>('/v1/app/notifications/unread-count');
  },

  markAsRead(notificationId: string) {
    return apiPost<ApiNotification>(`/v1/app/notifications/${notificationId}/read`);
  },

  markAllAsRead() {
    return apiPost<{ ok: boolean }>('/v1/app/notifications/read-all');
  },
};
