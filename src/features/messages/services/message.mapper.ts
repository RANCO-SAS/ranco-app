import type {
  ConversationRow,
  MessageRow,
  ProfileSummaryRow,
} from '@/features/messages/types/message-db.types';
import type { Conversation, Message } from '@/features/messages/types/message.types';

function mapParticipant(row: ProfileSummaryRow | undefined, fallbackId: string): Conversation['client'] {
  return {
    id: row?.id ?? fallbackId,
    fullName: row?.full_name ?? 'Usuario',
    avatarUrl: row?.avatar_url ?? null,
  };
}

export function mapConversationRow(
  row: ConversationRow,
  participants: {
    client?: ProfileSummaryRow;
    professional?: ProfileSummaryRow;
  },
): Conversation {
  return {
    id: row.id,
    serviceRequestId: row.service_request_id,
    clientId: row.client_id,
    professionalId: row.professional_id,
    serviceRequestTitle: row.service_request?.title ?? 'Solicitud',
    serviceRequestStatus: row.service_request?.status ?? 'published',
    client: mapParticipant(participants.client, row.client_id),
    professional: mapParticipant(participants.professional, row.professional_id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMessageRow(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    type: row.message_type,
    content: row.content,
    mediaUrl: row.media_url,
    createdAt: row.created_at,
  };
}
