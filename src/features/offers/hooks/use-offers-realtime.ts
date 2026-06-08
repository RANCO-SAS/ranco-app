import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useWebSocketSubscribe } from '@/hooks/use-websocket-subscribe';
import { queryKeys } from '@/lib/query-keys';

type UseOffersRealtimeOptions = {
  conversationId: string | undefined;
  enabled?: boolean;
};

export function useOffersRealtime({
  conversationId,
  enabled = true,
}: UseOffersRealtimeOptions) {
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(conversationId);

  const handleEvent = useCallback(() => {
    if (!conversationId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: queryKeys.offers.byConversation(conversationId),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.offers.pending(conversationId),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.messages.thread(conversationId),
    });
    void queryClient.invalidateQueries({
      queryKey: [...queryKeys.messages.thread(conversationId), 'messages'],
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
  }, [conversationId, queryClient]);

  useWebSocketSubscribe({
    enabled: isEnabled,
    channel: conversationId ? `conversation:${conversationId}` : '',
    eventType: 'offer.updated',
    onEvent: handleEvent,
  });
}
