import type { ServiceOffer } from '@/features/offers/types/offer';

export type ServiceOfferRow = {
  id: string;
  conversation_id: string;
  service_request_id: string;
  proposer_id: string;
  amount_cents: number;
  currency: 'COP';
  status: ServiceOffer['status'];
  parent_offer_id: string | null;
  accepted_by: string | null;
  created_at: string;
  updated_at: string;
};

export function mapServiceOfferRow(row: ServiceOfferRow): ServiceOffer {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    serviceRequestId: row.service_request_id,
    proposerId: row.proposer_id,
    amountCents: row.amount_cents,
    currency: row.currency,
    status: row.status,
    parentOfferId: row.parent_offer_id,
    acceptedBy: row.accepted_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
