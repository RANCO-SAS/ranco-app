export type Conversation = {
  id: string;
  serviceRequestId: string;
  clientId: string;
  professionalId: string;
  serviceRequestTitle: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
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
  content: string;
};
