import { getSupabaseClient } from '@/services/supabase/client';

import {
  mapNotificationRow,
  type NotificationRow,
} from '@/features/notifications/types/notification-db.types';
import type { AppNotification } from '@/features/notifications/types/notification.types';

const NOTIFICATIONS_TABLE = 'notifications';

export const notificationService = {
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(NOTIFICATIONS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return (data as NotificationRow[]).map(mapNotificationRow);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from(NOTIFICATIONS_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) {
      throw error;
    }

    return count ?? 0;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from(NOTIFICATIONS_TABLE)
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      throw error;
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from(NOTIFICATIONS_TABLE)
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) {
      throw error;
    }
  },
};
