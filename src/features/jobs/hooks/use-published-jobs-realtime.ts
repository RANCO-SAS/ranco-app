import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useWebSocketSubscribe } from '@/hooks/use-websocket-subscribe';
import { queryKeys } from '@/lib/query-keys';

type UsePublishedJobsRealtimeOptions = {
  userId?: string;
  enabled?: boolean;
};

export function usePublishedJobsRealtime({
  userId,
  enabled = true,
}: UsePublishedJobsRealtimeOptions) {
  const queryClient = useQueryClient();

  const handleEvent = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.published });
  }, [queryClient]);

  useWebSocketSubscribe({
    enabled: enabled && Boolean(userId),
    channel: userId ? `user:${userId}` : '',
    eventType: 'job.updated',
    onEvent: handleEvent,
  });
}
