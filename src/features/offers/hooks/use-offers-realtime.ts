import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSupabasePostgresChanges } from '@/hooks/use-supabase-postgres-changes';
import type { ServiceOfferRow } from '@/features/offers/services/offer.mapper';
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

  const handlePayload = useCallback(() => {
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

  useSupabasePostgresChanges<ServiceOfferRow>({
    enabled: isEnabled,
    channelName: `service-offers:${conversationId ?? 'inactive'}`,
    table: 'service_offers',
    filter: conversationId ? `conversation_id=eq.${conversationId}` : undefined,
    onPayload: handlePayload,
  });
}
