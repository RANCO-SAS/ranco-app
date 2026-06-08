import { mapApiServiceOffer } from '@/features/offers/services/offer.mapper';
import type {
  CounterOfferInput,
  CreateOfferInput,
  OfferActionInput,
  ServiceOffer,
} from '@/features/offers/types/offer';
import { offerRepository } from '@/repositories/offer.repository';
import { isApiError } from '@/services/api/errors';

function mapOfferError(error: unknown): never {
  if (isApiError(error)) {
    throw new Error(error.message);
  }

  throw error;
}

async function getConversationOffers(conversationId: string): Promise<ServiceOffer[]> {
  const data = await offerRepository.getConversationOffers(conversationId);
  return data.map(mapApiServiceOffer);
}

async function getPendingOffer(conversationId: string): Promise<ServiceOffer | null> {
  const data = await offerRepository.getPendingOffer(conversationId);
  return data ? mapApiServiceOffer(data) : null;
}

async function createOffer(input: CreateOfferInput): Promise<string> {
  try {
    const offer = await offerRepository.create({
      conversationId: input.conversationId,
      amountCents: input.amountCents,
    });

    return offer.id;
  } catch (error) {
    mapOfferError(error);
  }
}

async function counterOffer(input: CounterOfferInput): Promise<string> {
  try {
    const offer = await offerRepository.counter({
      parentOfferId: input.parentOfferId,
      amountCents: input.amountCents,
    });

    return offer.id;
  } catch (error) {
    mapOfferError(error);
  }
}

async function acceptOffer(input: OfferActionInput): Promise<void> {
  try {
    await offerRepository.accept(input.offerId);
  } catch (error) {
    mapOfferError(error);
  }
}

async function withdrawOffer(input: OfferActionInput): Promise<void> {
  try {
    await offerRepository.withdraw(input.offerId);
  } catch (error) {
    mapOfferError(error);
  }
}

async function declineOffer(input: OfferActionInput): Promise<void> {
  try {
    await offerRepository.decline(input.offerId);
  } catch (error) {
    mapOfferError(error);
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
