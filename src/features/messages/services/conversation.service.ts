import type { ConversationRow, MessageRow, ProfileSummaryRow } from '@/features/messages/types/message-db.types';
import type {
  Conversation,
  Message,
  SendImageMessageInput,
  SendTextMessageInput,
  StartConversationInput,
} from '@/features/messages/types/message.types';
import {
  mapConversationRow,
  mapMessageRow,
} from '@/features/messages/services/message.mapper';
import { getSupabaseClient } from '@/services/supabase/client';
import { storageService } from '@/services/storage/storage.service';
import { devError, devLog } from '@/lib/dev-logger';

const CONVERSATIONS_TABLE = 'conversations';
const MESSAGES_TABLE = 'messages';
const PROFILES_TABLE = 'user_profiles';

const CONVERSATION_SELECT = `
  *,
  service_request:service_requests (
    title,
    status,
    category_id,
    subcategory_id,
    assigned_professional_id
  )
`;

async function getParticipantProfiles(
  clientId: string,
  professionalId: string,
): Promise<{ client?: ProfileSummaryRow; professional?: ProfileSummaryRow }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select('id, full_name, avatar_url')
    .in('id', [clientId, professionalId]);

  if (error) {
    throw error;
  }

  const profiles = (data ?? []) as ProfileSummaryRow[];

  return {
    client: profiles.find((profile) => profile.id === clientId),
    professional: profiles.find((profile) => profile.id === professionalId),
  };
}

async function mapConversation(data: ConversationRow): Promise<Conversation> {
  const participants = await getParticipantProfiles(data.client_id, data.professional_id);
  return mapConversationRow(data, participants);
}

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

  const rows = (data ?? []) as ConversationRow[];
  return Promise.all(rows.map((row) => mapConversation(row)));
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

  return mapConversation(data as ConversationRow);
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
    return mapConversation(existing.data as ConversationRow);
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

  return mapConversation(data as ConversationRow);
}

async function sendTextMessage(input: SendTextMessageInput): Promise<Message> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      message_type: 'text',
      content: input.content.trim(),
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '42501' || error.message.includes('row-level security')) {
      throw new Error('Ya no puedes enviar mensajes en esta conversación.');
    }

    throw error;
  }

  return mapMessageRow(data as MessageRow);
}

async function sendImageMessage(input: SendImageMessageInput): Promise<Message> {
  devLog('storage', 'sendImageMessage:start', {
    conversationId: input.conversationId,
    senderId: input.senderId,
    uriScheme: input.mediaUri.split(':')[0],
  });

  let mediaUrl: string;

  try {
    mediaUrl = await storageService.uploadChatImage(input.conversationId, input.mediaUri);
  } catch (error) {
    devError('storage', 'sendImageMessage:upload-failed', error, {
      conversationId: input.conversationId,
    });
    throw error;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      message_type: 'image',
      content: 'Imagen',
      media_url: mediaUrl,
    })
    .select('*')
    .single();

  if (error) {
    devError('storage', 'sendImageMessage:insert-failed', error, {
      conversationId: input.conversationId,
    });

    if (error.code === '42501' || error.message.includes('row-level security')) {
      throw new Error('Ya no puedes enviar mensajes en esta conversación.');
    }

    throw error;
  }

  devLog('storage', 'sendImageMessage:success', { messageId: data.id });
  return mapMessageRow(data as MessageRow);
}

async function markMessagesDelivered(messageIds: string[]): Promise<void> {
  if (messageIds.length === 0) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('mark_messages_delivered', {
    p_message_ids: messageIds,
  });

  if (error) {
    throw error;
  }
}

async function markMessagesRead(messageIds: string[]): Promise<void> {
  if (messageIds.length === 0) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('mark_messages_read', {
    p_message_ids: messageIds,
  });

  if (error) {
    throw error;
  }
}

export const conversationService = {
  getConversations,
  getConversationById,
  getMessages,
  startConversation,
  sendTextMessage,
  sendImageMessage,
  markMessagesDelivered,
  markMessagesRead,
};
