import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';

export type ConversationRow = {
  id: string;
  service_request_id: string;
  client_id: string;
  professional_id: string;
  created_at: string;
  updated_at: string;
  service_request: {
    title: string;
    status: ServiceRequestStatus;
    category_id: string;
    subcategory_id: string;
    assigned_professional_id: string | null;
  } | null;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image';
  media_url: string | null;
  created_at: string;
};

export type ProfileSummaryRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};
