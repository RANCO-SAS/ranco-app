import type { ApiConversation, ApiMessage } from '@/repositories/conversation.repository';
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

export function mapApiConversation(row: ApiConversation): Conversation {
  return {
    id: row.id,
    serviceRequestId: row.serviceRequestId,
    clientId: row.clientId,
    professionalId: row.professionalId,
    serviceRequestTitle: row.serviceRequest?.title ?? 'Solicitud',
    serviceRequestStatus: row.serviceRequest?.status ?? 'published',
    client: {
      id: row.client?.id ?? row.clientId,
      fullName: row.client?.fullName ?? 'Usuario',
      avatarUrl: row.client?.avatarUrl ?? null,
    },
    professional: {
      id: row.professional?.id ?? row.professionalId,
      fullName: row.professional?.fullName ?? 'Usuario',
      avatarUrl: row.professional?.avatarUrl ?? null,
    },
    closedAt: row.closedAt ?? null,
    closedReason: row.closedReason ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapApiMessage(row: ApiMessage): Message {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    type: row.messageType as Message['type'],
    content: row.content,
    mediaUrl: row.mediaUrl ?? null,
    deliveredAt: row.deliveredAt ?? null,
    readAt: row.readAt ?? null,
    createdAt: row.createdAt,
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
    closedAt: row.closed_at ?? null,
    closedReason: row.closed_reason ?? null,
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
    deliveredAt: row.delivered_at,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}
