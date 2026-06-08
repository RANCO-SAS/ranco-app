import { useCallback, useEffect } from 'react';

import { isApiConfigured } from '@/lib/env';
import { websocketClient } from '@/services/api/websocket-client';
import { useWebSocketSubscribe } from '@/hooks/use-websocket-subscribe';

type UseWebSocketBroadcastOptions<TPayload extends Record<string, unknown>> = {
  enabled?: boolean;
  channel: string;
  event: string;
  onPayload: (payload: TPayload) => void;
};

export function useWebSocketBroadcast<TPayload extends Record<string, unknown>>({
  enabled = true,
  channel,
  event,
  onPayload,
}: UseWebSocketBroadcastOptions<TPayload>) {
  useWebSocketSubscribe({
    enabled,
    channel,
    eventType: event,
    onEvent: (wsEvent) => {
      if (wsEvent.payload && typeof wsEvent.payload === 'object') {
        onPayload(wsEvent.payload as TPayload);
      }
    },
  });
}

type BroadcastTypingPayload = {
  userId: string;
  userName: string;
  isTyping: boolean;
};

export function useWebSocketBroadcastSender(channel: string, enabled = true) {
  useEffect(() => {
    if (!enabled || !isApiConfigured()) {
      return;
    }

    void websocketClient.connect();
  }, [channel, enabled]);

  const sendBroadcast = useCallback(
    (event: string, payload: BroadcastTypingPayload) => {
      websocketClient.broadcast(channel, event, payload);
    },
    [channel],
  );

  return { sendBroadcast };
}
