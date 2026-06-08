import type { ApiServiceOffer } from '@/repositories/offer.repository';
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

export function mapApiServiceOffer(offer: ApiServiceOffer): ServiceOffer {
  return {
    id: offer.id,
    conversationId: offer.conversationId,
    serviceRequestId: offer.serviceRequestId,
    proposerId: offer.proposerId,
    amountCents: offer.amountCents,
    currency: (offer.currency as ServiceOffer['currency']) ?? 'COP',
    status: offer.status as ServiceOffer['status'],
    parentOfferId: offer.parentOfferId ?? null,
    acceptedBy: offer.acceptedBy ?? null,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
  };
}

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
