import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { conversationService } from '@/features/messages/services/conversation.service';
import type {
  SendImageMessageInput,
  SendTextMessageInput,
} from '@/features/messages/types/message.types';
import { queryKeys } from '@/lib/query-keys';

export function useConversations(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.messages.conversations(userId ?? 'unknown'),
    queryFn: () => conversationService.getConversations(userId!),
    enabled: Boolean(userId),
    refetchInterval: 10_000,
  });
}

export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.messages.thread(conversationId ?? 'unknown'),
    queryFn: () => conversationService.getConversationById(conversationId!),
    enabled: Boolean(conversationId),
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.messages.thread(conversationId ?? 'unknown'), 'messages'],
    queryFn: () => conversationService.getMessages(conversationId!),
    enabled: Boolean(conversationId),
    refetchInterval: 3_000,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conversationService.startConversation,
    onSuccess: (conversation) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(conversation.clientId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(conversation.professionalId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

export function useSendTextMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendTextMessageInput) => conversationService.sendTextMessage(input),
    onSuccess: (message) => {
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.messages.thread(message.conversationId), 'messages'],
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
  });
}

export function useSendImageMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendImageMessageInput) => conversationService.sendImageMessage(input),
    onSuccess: (message) => {
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.messages.thread(message.conversationId), 'messages'],
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
  });
}
