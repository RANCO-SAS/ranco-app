import { useEffect, useRef } from 'react';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { getSupabaseClient } from '@/services/supabase/client';

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

type UseSupabasePostgresChangesOptions<T extends Record<string, unknown>> = {
  enabled?: boolean;
  channelName: string;
  table: string;
  schema?: string;
  event?: PostgresChangeEvent;
  filter?: string;
  onPayload: (payload: RealtimePostgresChangesPayload<T>) => void;
};

export function useSupabasePostgresChanges<T extends Record<string, unknown>>({
  enabled = true,
  channelName,
  table,
  schema = 'public',
  event = '*',
  filter,
  onPayload,
}: UseSupabasePostgresChangesOptions<T>) {
  const onPayloadRef = useRef(onPayload);

  useEffect(() => {
    onPayloadRef.current = onPayload;
  }, [onPayload]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const supabase = getSupabaseClient();
    let channel: RealtimeChannel = supabase.channel(channelName);

    channel = channel.on(
      'postgres_changes',
      {
        event,
        schema,
        table,
        filter,
      },
      (payload) => {
        onPayloadRef.current(payload as RealtimePostgresChangesPayload<T>);
      },
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelName, enabled, event, filter, schema, table]);
}
