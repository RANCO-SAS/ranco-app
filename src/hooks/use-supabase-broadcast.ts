import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { isSupabaseConfigured } from '@/lib/env';
import { getSupabaseClient } from '@/services/supabase/client';

type UseSupabaseBroadcastOptions<TPayload extends Record<string, unknown>> = {
  enabled?: boolean;
  channelName: string;
  event: string;
  onPayload: (payload: TPayload) => void;
};

export function useSupabaseBroadcast<TPayload extends Record<string, unknown>>({
  enabled = true,
  channelName,
  event,
  onPayload,
}: UseSupabaseBroadcastOptions<TPayload>) {
  const onPayloadRef = useRef(onPayload);

  useEffect(() => {
    onPayloadRef.current = onPayload;
  }, [onPayload]);

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) {
      return;
    }

    const supabase = getSupabaseClient();
    const channel: RealtimeChannel = supabase
      .channel(channelName, {
        config: {
          broadcast: {
            self: false,
          },
        },
      })
      .on('broadcast', { event }, (message) => {
        if (message.payload && typeof message.payload === 'object') {
          onPayloadRef.current(message.payload as TPayload);
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelName, enabled, event]);
}

type BroadcastTypingPayload = {
  userId: string;
  userName: string;
  isTyping: boolean;
};

export function useSupabaseBroadcastSender(channelName: string, enabled = true) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) {
      return;
    }

    const supabase = getSupabaseClient();
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: false,
        },
      },
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [channelName, enabled]);

  const sendBroadcast = (event: string, payload: BroadcastTypingPayload) => {
    void channelRef.current?.send({
      type: 'broadcast',
      event,
      payload,
    });
  };

  return { sendBroadcast };
}
