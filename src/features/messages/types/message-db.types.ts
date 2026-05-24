export type ConversationRow = {
  id: string;
  service_request_id: string;
  client_id: string;
  professional_id: string;
  created_at: string;
  updated_at: string;
  service_request: {
    title: string;
    category_id: string;
    subcategory_id: string;
  } | null;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};
