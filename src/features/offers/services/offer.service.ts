import { mapServiceOfferRow, type ServiceOfferRow } from '@/features/offers/services/offer.mapper';
import type {
  CounterOfferInput,
  CreateOfferInput,
  OfferActionInput,
  ServiceOffer,
} from '@/features/offers/types/offer';
import { getSupabaseClient } from '@/services/supabase/client';

const SERVICE_OFFERS_TABLE = 'service_offers';

async function getConversationOffers(conversationId: string): Promise<ServiceOffer[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(SERVICE_OFFERS_TABLE)
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ServiceOfferRow[]).map(mapServiceOfferRow);
}

async function getPendingOffer(conversationId: string): Promise<ServiceOffer | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(SERVICE_OFFERS_TABLE)
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('status', 'pending')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapServiceOfferRow(data as ServiceOfferRow);
}

async function createOffer(input: CreateOfferInput): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('create_service_offer', {
    p_conversation_id: input.conversationId,
    p_amount_cents: input.amountCents,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

async function counterOffer(input: CounterOfferInput): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('counter_service_offer', {
    p_parent_offer_id: input.parentOfferId,
    p_amount_cents: input.amountCents,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

async function acceptOffer(input: OfferActionInput): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('accept_service_offer', {
    p_offer_id: input.offerId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function withdrawOffer(input: OfferActionInput): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('withdraw_service_offer', {
    p_offer_id: input.offerId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function declineOffer(input: OfferActionInput): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('decline_service_offer', {
    p_offer_id: input.offerId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export const offerService = {
  getConversationOffers,
  getPendingOffer,
  createOffer,
  counterOffer,
  acceptOffer,
  withdrawOffer,
  declineOffer,
};
