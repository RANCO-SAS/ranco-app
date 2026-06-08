import { useEffect, useRef } from 'react';

import { isApiConfigured } from '@/lib/env';
import { websocketClient, type WsEvent } from '@/services/api/websocket-client';

type UseWebSocketSubscribeOptions = {
  enabled?: boolean;
  channel: string;
  eventType?: string;
  onEvent: (event: WsEvent) => void;
};

export function useWebSocketSubscribe({
  enabled = true,
  channel,
  eventType,
  onEvent,
}: UseWebSocketSubscribeOptions) {
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !isApiConfigured() || !channel) {
      return;
    }

    return websocketClient.subscribe(channel, (event) => {
      if (eventType && event.type !== eventType) {
        return;
      }

      onEventRef.current(event);
    });
  }, [channel, enabled, eventType]);
}
