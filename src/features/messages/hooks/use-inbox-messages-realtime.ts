import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useWebSocketSubscribe } from '@/hooks/use-websocket-subscribe';
import { queryKeys } from '@/lib/query-keys';

type UseInboxMessagesRealtimeOptions = {
  userId: string | undefined;
  enabled?: boolean;
};

export function useInboxMessagesRealtime({
  userId,
  enabled = true,
}: UseInboxMessagesRealtimeOptions) {
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(userId);

  const handleEvent = useCallback(() => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: queryKeys.messages.conversations(userId),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(userId) });
  }, [queryClient, userId]);

  useWebSocketSubscribe({
    enabled: isEnabled,
    channel: userId ? `user:${userId}` : '',
    eventType: 'conversation.updated',
    onEvent: handleEvent,
  });
}
