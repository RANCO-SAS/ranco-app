import type { ConversationRow, MessageRow } from '@/features/messages/types/message-db.types';
import type {
  Conversation,
  Message,
  SendMessageInput,
  StartConversationInput,
} from '@/features/messages/types/message.types';
import {
  mapConversationRow,
  mapMessageRow,
} from '@/features/messages/services/message.mapper';
import { getSupabaseClient } from '@/services/supabase/client';

const CONVERSATIONS_TABLE = 'conversations';
const MESSAGES_TABLE = 'messages';

const CONVERSATION_SELECT = `
  *,
  service_request:service_requests ( title, category_id, subcategory_id )
`;

async function getConversations(userId: string): Promise<Conversation[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(CONVERSATIONS_TABLE)
    .select(CONVERSATION_SELECT)
    .or(`client_id.eq.${userId},professional_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ConversationRow[]).map(mapConversationRow);
}

async function getConversationById(conversationId: string): Promise<Conversation | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(CONVERSATIONS_TABLE)
    .select(CONVERSATION_SELECT)
    .eq('id', conversationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapConversationRow(data as ConversationRow);
}

async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data as MessageRow[]).map(mapMessageRow);
}

async function startConversation(input: StartConversationInput): Promise<Conversation> {
  const supabase = getSupabaseClient();

  const existing = await supabase
    .from(CONVERSATIONS_TABLE)
    .select(CONVERSATION_SELECT)
    .eq('service_request_id', input.serviceRequestId)
    .eq('professional_id', input.professionalId)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data) {
    return mapConversationRow(existing.data as ConversationRow);
  }

  const { data, error } = await supabase
    .from(CONVERSATIONS_TABLE)
    .insert({
      service_request_id: input.serviceRequestId,
      client_id: input.clientId,
      professional_id: input.professionalId,
    })
    .select(CONVERSATION_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapConversationRow(data as ConversationRow);
}

async function sendMessage(input: SendMessageInput): Promise<Message> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      content: input.content.trim(),
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapMessageRow(data as MessageRow);
}

export const conversationService = {
  getConversations,
  getConversationById,
  getMessages,
  startConversation,
  sendMessage,
};
