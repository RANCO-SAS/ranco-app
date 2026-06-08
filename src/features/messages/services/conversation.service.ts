import type {
  Conversation,
  Message,
  SendImageMessageInput,
  SendTextMessageInput,
  StartConversationInput,
} from '@/features/messages/types/message.types';
import {
  mapApiConversation,
  mapApiMessage,
} from '@/features/messages/services/message.mapper';
import { conversationRepository } from '@/repositories/conversation.repository';
import { storageService } from '@/services/storage/storage.service';
import { devError, devLog } from '@/lib/dev-logger';
import { isApiError } from '@/services/api/errors';

async function getConversations(userId: string): Promise<Conversation[]> {
  const data = await conversationRepository.getConversations();
  return data.map(mapApiConversation);
}

async function getConversationById(conversationId: string): Promise<Conversation | null> {
  try {
    const data = await conversationRepository.getConversationById(conversationId);
    return mapApiConversation(data);
  } catch (error) {
    if (isApiError(error) && error.code === 'not_found') {
      return null;
    }

    throw error;
  }
}

async function getMessages(conversationId: string): Promise<Message[]> {
  const data = await conversationRepository.getMessages(conversationId);
  return data.map(mapApiMessage);
}

async function startConversation(input: StartConversationInput): Promise<Conversation> {
  const data = await conversationRepository.startConversation({
    serviceRequestId: input.serviceRequestId,
    professionalId: input.professionalId,
  });

  return mapApiConversation(data);
}

async function sendTextMessage(input: SendTextMessageInput): Promise<Message> {
  try {
    const data = await conversationRepository.sendTextMessage(input.conversationId, {
      content: input.content.trim(),
    });

    return mapApiMessage(data);
  } catch (error) {
    if (isApiError(error) && (error.code === 'forbidden' || error.code === 'unprocessable')) {
      throw new Error('Ya no puedes enviar mensajes en esta conversación.');
    }

    throw error;
  }
}

async function sendImageMessage(input: SendImageMessageInput): Promise<Message> {
  devLog('storage', 'sendImageMessage:start', {
    conversationId: input.conversationId,
    senderId: input.senderId,
    uriScheme: input.mediaUri.split(':')[0],
  });

  let mediaUrl: string;

  try {
    mediaUrl = await storageService.uploadChatImage(input.conversationId, input.mediaUri);
  } catch (error) {
    devError('storage', 'sendImageMessage:upload-failed', error, {
      conversationId: input.conversationId,
    });
    throw error;
  }

  try {
    const data = await conversationRepository.sendImageMessage(input.conversationId, {
      mediaUrl,
    });

    devLog('storage', 'sendImageMessage:success', { messageId: data.id });
    return mapApiMessage(data);
  } catch (error) {
    devError('storage', 'sendImageMessage:insert-failed', error, {
      conversationId: input.conversationId,
    });

    if (isApiError(error) && (error.code === 'forbidden' || error.code === 'unprocessable')) {
      throw new Error('Ya no puedes enviar mensajes en esta conversación.');
    }

    throw error;
  }
}

async function markMessagesDelivered(messageIds: string[], conversationId?: string): Promise<void> {
  if (messageIds.length === 0 || !conversationId) {
    return;
  }

  await conversationRepository.markMessagesDelivered(conversationId, {
    messageIds,
  });
}

async function markMessagesRead(messageIds: string[], conversationId?: string): Promise<void> {
  if (messageIds.length === 0 || !conversationId) {
    return;
  }

  await conversationRepository.markMessagesRead(conversationId, {
    messageIds,
  });
}

export const conversationService = {
  getConversations,
  getConversationById,
  getMessages,
  startConversation,
  sendTextMessage,
  sendImageMessage,
  markMessagesDelivered,
  markMessagesRead,
};
