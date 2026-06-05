import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';

export type ConversationParticipant = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
};

export type ConversationClosedReason = 'assigned_elsewhere' | 'request_cancelled';

export type Conversation = {
  id: string;
  serviceRequestId: string;
  clientId: string;
  professionalId: string;
  serviceRequestTitle: string;
  serviceRequestStatus: ServiceRequestStatus;
  client: ConversationParticipant;
  professional: ConversationParticipant;
  closedAt: string | null;
  closedReason: ConversationClosedReason | null;
  createdAt: string;
  updatedAt: string;
};

export type MessageType = 'text' | 'image' | 'offer';

export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read';

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
};

export type StartConversationInput = {
  serviceRequestId: string;
  clientId: string;
  professionalId: string;
};

export type SendMessageInput = {
  conversationId: string;
  senderId: string;
  content?: string;
  mediaUri?: string;
};

export type SendTextMessageInput = {
  conversationId: string;
  senderId: string;
  content: string;
};

export type SendImageMessageInput = {
  conversationId: string;
  senderId: string;
  mediaUri: string;
};
