import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useWebSocketSubscribe } from '@/hooks/use-websocket-subscribe';
import { queryKeys } from '@/lib/query-keys';

type UseClientJobsRealtimeOptions = {
  clientId: string | undefined;
  enabled?: boolean;
};

export function useClientJobsRealtime({ clientId, enabled = true }: UseClientJobsRealtimeOptions) {
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(clientId);

  const handleEvent = useCallback(() => {
    if (!clientId) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.client(clientId) });
  }, [clientId, queryClient]);

  useWebSocketSubscribe({
    enabled: isEnabled,
    channel: clientId ? `user:${clientId}` : '',
    eventType: 'job.updated',
    onEvent: handleEvent,
  });
}
