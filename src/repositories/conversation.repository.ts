import { apiGet, apiPost } from '@/services/api/client';

export type ApiProfileSummary = {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
};

export type ApiServiceRequestSummary = {
  id: string;
  title: string;
  status: string;
  categoryId: string;
  subcategoryId: string;
  assignedProfessionalId?: string | null;
};

export type ApiConversation = {
  id: string;
  serviceRequestId: string;
  clientId: string;
  professionalId: string;
  closedAt?: string | null;
  closedReason?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: ApiProfileSummary;
  professional?: ApiProfileSummary;
  serviceRequest?: ApiServiceRequestSummary;
};

export type ApiMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  mediaUrl?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type StartConversationBody = {
  serviceRequestId: string;
  professionalId?: string;
};

export type SendTextMessageBody = {
  content: string;
};

export type SendImageMessageBody = {
  mediaUrl: string;
};

export type MarkMessagesBody = {
  messageIds: string[];
};

export const conversationRepository = {
  getConversations() {
    return apiGet<ApiConversation[]>('/v1/app/conversations');
  },

  getConversationById(conversationId: string) {
    return apiGet<ApiConversation>(`/v1/app/conversations/${conversationId}`);
  },

  startConversation(body: StartConversationBody) {
    return apiPost<ApiConversation>('/v1/app/conversations', body);
  },

  getMessages(conversationId: string) {
    return apiGet<ApiMessage[]>(`/v1/app/conversations/${conversationId}/messages`);
  },

  sendTextMessage(conversationId: string, body: SendTextMessageBody) {
    return apiPost<ApiMessage>(`/v1/app/conversations/${conversationId}/messages/text`, body);
  },

  sendImageMessage(conversationId: string, body: SendImageMessageBody) {
    return apiPost<ApiMessage>(`/v1/app/conversations/${conversationId}/messages/image`, body);
  },

  markMessagesDelivered(conversationId: string, body: MarkMessagesBody) {
    return apiPost<{ ok: boolean }>(
      `/v1/app/conversations/${conversationId}/messages/delivered`,
      body,
    );
  },

  markMessagesRead(conversationId: string, body: MarkMessagesBody) {
    return apiPost<{ ok: boolean }>(`/v1/app/conversations/${conversationId}/messages/read`, body);
  },
};
