import type { ConversationRow, MessageRow } from '@/features/messages/types/message-db.types';
import type { Conversation, Message } from '@/features/messages/types/message.types';

export function mapConversationRow(row: ConversationRow): Conversation {
  return {
    id: row.id,
    serviceRequestId: row.service_request_id,
    clientId: row.client_id,
    professionalId: row.professional_id,
    serviceRequestTitle: row.service_request?.title ?? 'Solicitud',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMessageRow(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    createdAt: row.created_at,
  };
}
