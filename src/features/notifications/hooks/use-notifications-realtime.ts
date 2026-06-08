import { useCallback } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import {
  canUseExpoNotifications,
  loadExpoNotificationsModule,
} from '@/features/notifications/utils/notifications-module';
import type { ApiNotification } from '@/repositories/notification.repository';
import { useWebSocketSubscribe } from '@/hooks/use-websocket-subscribe';
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

  const handleEvent = useCallback(
    (payload: unknown) => {
      if (!userId) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(userId),
      });

      if (AppState.currentState === 'active' || !canUseExpoNotifications()) {
        return;
      }

      const notification = payload as ApiNotification;

      void loadExpoNotificationsModule().then((Notifications) => {
        if (!Notifications) {
          return;
        }

        return Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: notification.data ?? {},
          },
          trigger: null,
        });
      });
    },
    [queryClient, userId],
  );

  useWebSocketSubscribe({
    enabled: isEnabled,
    channel: userId ? `user:${userId}` : '',
    eventType: 'notification.created',
    onEvent: (event) => handleEvent(event.payload),
  });
}
