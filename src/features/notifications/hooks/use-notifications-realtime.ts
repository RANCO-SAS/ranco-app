import { useCallback } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { mapNotificationRow, type NotificationRow } from '@/features/notifications/types/notification-db.types';
import { supportsNativePushNotifications } from '@/features/notifications/utils/push-environment';
import { useSupabasePostgresChanges } from '@/hooks/use-supabase-postgres-changes';
import { queryKeys } from '@/lib/query-keys';

type UseNotificationsRealtimeOptions = {
  userId: string | undefined;
  enabled?: boolean;
};

export function useNotificationsRealtime({
  userId,
  enabled = true,
}: UseNotificationsRealtimeOptions) {
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(userId);

  const handlePayload = useCallback(
    (payload: RealtimePostgresChangesPayload<NotificationRow>) => {
      if (!userId) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(userId),
      });

      if (payload.eventType !== 'INSERT' || !payload.new) {
        return;
      }

      if (AppState.currentState === 'active' || !supportsNativePushNotifications()) {
        return;
      }

      const notification = mapNotificationRow(payload.new);

      void import('expo-notifications').then((Notifications) =>
        Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: notification.data,
          },
          trigger: null,
        }),
      );
    },
    [queryClient, userId],
  );

  useSupabasePostgresChanges<NotificationRow>({
    enabled: isEnabled,
    channelName: `notifications:${userId ?? 'inactive'}`,
    table: 'notifications',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    onPayload: handlePayload,
  });
}
