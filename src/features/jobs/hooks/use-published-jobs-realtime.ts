import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSupabasePostgresChanges } from '@/hooks/use-supabase-postgres-changes';
import { queryKeys } from '@/lib/query-keys';

type UsePublishedJobsRealtimeOptions = {
  enabled?: boolean;
};

export function usePublishedJobsRealtime({ enabled = true }: UsePublishedJobsRealtimeOptions) {
  const queryClient = useQueryClient();

  const handlePayload = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.published });
  }, [queryClient]);

  useSupabasePostgresChanges({
    enabled,
    channelName: 'published-service-requests',
    table: 'service_requests',
    onPayload: handlePayload,
  });
}
