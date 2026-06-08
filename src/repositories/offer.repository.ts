import { apiGet, apiPost } from '@/services/api/client';

export type ApiServiceOffer = {
  id: string;
  conversationId: string;
  serviceRequestId: string;
  proposerId: string;
  amountCents: number;
  currency: string;
  status: string;
  parentOfferId?: string | null;
  acceptedBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOfferBody = {
  conversationId: string;
  amountCents: number;
};

export type CounterOfferBody = {
  parentOfferId: string;
  amountCents: number;
};

export const offerRepository = {
  getConversationOffers(conversationId: string) {
    return apiGet<ApiServiceOffer[]>(`/v1/app/conversations/${conversationId}/offers`);
  },

  getPendingOffer(conversationId: string) {
    return apiGet<ApiServiceOffer | null>(
      `/v1/app/conversations/${conversationId}/offers/pending`,
    );
  },

  create(body: CreateOfferBody) {
    return apiPost<ApiServiceOffer>('/v1/app/offers', body);
  },

  counter(body: CounterOfferBody) {
    return apiPost<ApiServiceOffer>('/v1/app/offers/counter', body);
  },

  accept(offerId: string) {
    return apiPost<ApiServiceOffer>(`/v1/app/offers/${offerId}/accept`);
  },

  decline(offerId: string) {
    return apiPost<ApiServiceOffer>(`/v1/app/offers/${offerId}/decline`);
  },

  withdraw(offerId: string) {
    return apiPost<ApiServiceOffer>(`/v1/app/offers/${offerId}/withdraw`);
  },
};
