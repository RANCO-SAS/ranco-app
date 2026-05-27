import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSupabasePostgresChanges } from '@/hooks/use-supabase-postgres-changes';
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

  const handlePayload = useCallback(() => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: queryKeys.messages.conversations(userId),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(userId) });
  }, [queryClient, userId]);

  useSupabasePostgresChanges({
    enabled: isEnabled,
    channelName: `inbox-messages:${userId ?? 'inactive'}`,
    table: 'messages',
    event: 'INSERT',
    onPayload: handlePayload,
  });
}
