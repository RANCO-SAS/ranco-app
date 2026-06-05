export type OfferStatus = 'pending' | 'accepted' | 'withdrawn' | 'superseded';

export const DEFAULT_OFFER_CURRENCY = 'COP' as const;

export type ServiceOffer = {
  id: string;
  conversationId: string;
  serviceRequestId: string;
  proposerId: string;
  amountCents: number;
  currency: typeof DEFAULT_OFFER_CURRENCY;
  status: OfferStatus;
  parentOfferId: string | null;
  acceptedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OfferMessagePayload = {
  offerId: string;
  amountCents: number;
  status: OfferStatus;
  proposerId: string;
  currency: typeof DEFAULT_OFFER_CURRENCY;
};

export type CreateOfferInput = {
  conversationId: string;
  amountCents: number;
};

export type CounterOfferInput = {
  parentOfferId: string;
  amountCents: number;
};

export type OfferActionInput = {
  offerId: string;
};
