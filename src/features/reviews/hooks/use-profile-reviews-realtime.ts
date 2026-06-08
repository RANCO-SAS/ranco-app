import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useWebSocketSubscribe } from '@/hooks/use-websocket-subscribe';
import { queryKeys } from '@/lib/query-keys';

type UseProfileReviewsRealtimeOptions = {
  userId: string | undefined;
  enabled?: boolean;
};

export function useProfileReviewsRealtime({
  userId,
  enabled = true,
}: UseProfileReviewsRealtimeOptions) {
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(userId);

  const handleEvent = useCallback(() => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.profile(userId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.portfolio(userId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
  }, [queryClient, userId]);

  useWebSocketSubscribe({
    enabled: isEnabled,
    channel: userId ? `user:${userId}` : '',
    eventType: 'review.created',
    onEvent: handleEvent,
  });
}
