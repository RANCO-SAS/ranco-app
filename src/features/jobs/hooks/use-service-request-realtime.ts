import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useWebSocketSubscribe } from '@/hooks/use-websocket-subscribe';
import { queryKeys } from '@/lib/query-keys';

type UseServiceRequestRealtimeOptions = {
  requestId: string | undefined;
  clientId?: string;
  assignedProfessionalId?: string;
  enabled?: boolean;
};

export function useServiceRequestRealtime({
  requestId,
  clientId,
  assignedProfessionalId,
  enabled = true,
}: UseServiceRequestRealtimeOptions) {
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(requestId);

  const handleEvent = useCallback(() => {
    if (!requestId) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(requestId) });

    if (clientId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.client(clientId) });
    }

    if (assignedProfessionalId) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.jobs.completedHistory(assignedProfessionalId),
      });
    }

    void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.published });
    void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.payments.byRequest(requestId) });
  }, [assignedProfessionalId, clientId, queryClient, requestId]);

  useWebSocketSubscribe({
    enabled: isEnabled,
    channel: requestId ? `job:${requestId}` : '',
    eventType: 'job.updated',
    onEvent: handleEvent,
  });
}
