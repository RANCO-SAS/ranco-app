import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';

export type ConversationParticipant = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
};

export type Conversation = {
  id: string;
  serviceRequestId: string;
  clientId: string;
  professionalId: string;
  serviceRequestTitle: string;
  serviceRequestStatus: ServiceRequestStatus;
  client: ConversationParticipant;
  professional: ConversationParticipant;
  createdAt: string;
  updatedAt: string;
};

export type MessageType = 'text' | 'image';

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl: string | null;
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
