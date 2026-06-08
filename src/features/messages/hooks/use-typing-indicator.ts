import { useCallback, useEffect, useRef, useState } from 'react';

import {
  useWebSocketBroadcast,
  useWebSocketBroadcastSender,
} from '@/hooks/use-websocket-broadcast';

const TYPING_EVENT = 'typing';
const TYPING_TIMEOUT_MS = 3_000;

type TypingPayload = {
  userId: string;
  userName: string;
  isTyping: boolean;
};

type UseTypingIndicatorOptions = {
  conversationId: string | undefined;
  userId: string | undefined;
  userName: string;
  draft: string;
  enabled?: boolean;
};

export function useTypingIndicator({
  conversationId,
  userId,
  userName,
  draft,
  enabled = true,
}: UseTypingIndicatorOptions) {
  const [typingLabel, setTypingLabel] = useState<string | null>(null);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastSentRef = useRef<boolean>(false);
  const channel = conversationId ? `typing:${conversationId}` : 'typing:inactive';
  const isEnabled = enabled && Boolean(conversationId && userId);

  const { sendBroadcast } = useWebSocketBroadcastSender(channel, isEnabled);

  const handleTypingPayload = useCallback(
    (payload: TypingPayload) => {
      if (!userId || payload.userId === userId) {
        return;
      }

      const existingTimeout = timeoutsRef.current.get(payload.userId);

      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      if (!payload.isTyping) {
        timeoutsRef.current.delete(payload.userId);
        setTypingLabel((current) => (current?.includes(payload.userName) ? null : current));
        return;
      }

      setTypingLabel(`${payload.userName} está escribiendo…`);

      const timeout = setTimeout(() => {
        timeoutsRef.current.delete(payload.userId);
        setTypingLabel(null);
      }, TYPING_TIMEOUT_MS);

      timeoutsRef.current.set(payload.userId, timeout);
    },
    [userId],
  );

  useWebSocketBroadcast<TypingPayload>({
    enabled: isEnabled,
    channel,
    event: TYPING_EVENT,
    onPayload: handleTypingPayload,
  });

  useEffect(() => {
    if (!isEnabled || !userId) {
      return;
    }

    const isTyping = draft.trim().length > 0;

    if (isTyping === lastSentRef.current) {
      return;
    }

    lastSentRef.current = isTyping;
    sendBroadcast(TYPING_EVENT, {
      userId,
      userName,
      isTyping,
    });
  }, [draft, isEnabled, sendBroadcast, userId, userName]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  return { typingLabel };
}
