import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { conversationService } from '@/features/messages/services/conversation.service';
import { mapApiMessage } from '@/features/messages/services/message.mapper';
import type { ApiMessage } from '@/repositories/conversation.repository';
import type { Message } from '@/features/messages/types/message.types';
import { useWebSocketSubscribe } from '@/hooks/use-websocket-subscribe';
import { queryKeys } from '@/lib/query-keys';

function getMessagesQueryKey(conversationId: string) {
  return [...queryKeys.messages.thread(conversationId), 'messages'] as const;
}

function upsertMessage(messages: Message[] | undefined, nextMessage: Message): Message[] {
  if (!messages) {
    return [nextMessage];
  }

  const existingIndex = messages.findIndex((message) => message.id === nextMessage.id);

  if (existingIndex === -1) {
    return [...messages, nextMessage];
  }

  const updated = [...messages];
  updated[existingIndex] = nextMessage;
  return updated;
}

type UseMessagesRealtimeOptions = {
  conversationId: string | undefined;
  userId: string | undefined;
  enabled?: boolean;
};

export function useMessagesRealtime({
  conversationId,
  userId,
  enabled = true,
}: UseMessagesRealtimeOptions) {
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(conversationId && userId);

  const handleEvent = useCallback(
    (payload: unknown) => {
      if (!conversationId) {
        return;
      }

      const queryKey = getMessagesQueryKey(conversationId);
      const message = mapApiMessage(payload as ApiMessage);

      queryClient.setQueryData<Message[]>(queryKey, (current) => upsertMessage(current, message));

      if (userId && message.senderId !== userId) {
        void conversationService.markMessagesDelivered([message.id], conversationId);
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
    [conversationId, queryClient, userId],
  );

  useWebSocketSubscribe({
    enabled: isEnabled,
    channel: conversationId ? `conversation:${conversationId}` : '',
    eventType: 'message.created',
    onEvent: (event) => handleEvent(event.payload),
  });
}

type UseMessageReceiptsOptions = {
  conversationId: string | undefined;
  userId: string | undefined;
  messages: Message[];
  enabled?: boolean;
};

export function useMessageReceipts({
  conversationId,
  userId,
  messages,
  enabled = true,
}: UseMessageReceiptsOptions) {
  useEffect(() => {
    if (!enabled || !conversationId || !userId || messages.length === 0) {
      return;
    }

    const pendingDeliveryIds = messages
      .filter((message) => message.senderId !== userId && !message.deliveredAt)
      .map((message) => message.id);

    const pendingReadIds = messages
      .filter((message) => message.senderId !== userId && !message.readAt)
      .map((message) => message.id);

    const syncReceipts = async () => {
      try {
        if (pendingDeliveryIds.length > 0) {
          await conversationService.markMessagesDelivered(pendingDeliveryIds, conversationId);
        }

        if (pendingReadIds.length > 0) {
          await conversationService.markMessagesRead(pendingReadIds, conversationId);
        }
      } catch {
        // Receipt sync is best-effort; realtime updates will retry on next render.
      }
    };

    void syncReceipts();
  }, [conversationId, enabled, messages, userId]);
}

type UseConversationsRealtimeOptions = {
  userId: string | undefined;
  enabled?: boolean;
};

export function useConversationsRealtime({ userId, enabled = true }: UseConversationsRealtimeOptions) {
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(userId);

  const handleEvent = useCallback(() => {
    if (!userId) {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: queryKeys.messages.conversations(userId),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
  }, [queryClient, userId]);

  useWebSocketSubscribe({
    enabled: isEnabled,
    channel: userId ? `user:${userId}` : '',
    eventType: 'conversation.updated',
    onEvent: handleEvent,
  });
}
