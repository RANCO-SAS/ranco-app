import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSupabasePostgresChanges } from '@/hooks/use-supabase-postgres-changes';
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

  const handlePayload = useCallback(() => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.profile(userId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.portfolio(userId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
  }, [queryClient, userId]);

  useSupabasePostgresChanges({
    enabled: isEnabled,
    channelName: `profile-reviews:${userId ?? 'inactive'}`,
    table: 'reviews',
    filter: userId ? `reviewee_id=eq.${userId}` : undefined,
    onPayload: handlePayload,
  });
}
