import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSupabasePostgresChanges } from '@/hooks/use-supabase-postgres-changes';
import { queryKeys } from '@/lib/query-keys';

type UseClientJobsRealtimeOptions = {
  clientId: string | undefined;
  enabled?: boolean;
};

export function useClientJobsRealtime({ clientId, enabled = true }: UseClientJobsRealtimeOptions) {
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(clientId);

  const handlePayload = useCallback(() => {
    if (!clientId) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.client(clientId) });
  }, [clientId, queryClient]);

  useSupabasePostgresChanges({
    enabled: isEnabled,
    channelName: `client-jobs:${clientId ?? 'inactive'}`,
    table: 'service_requests',
    filter: clientId ? `client_id=eq.${clientId}` : undefined,
    onPayload: handlePayload,
  });
}
