import { mapApiServiceOffer } from '@/features/offers/services/offer.mapper';
import type {
  CounterOfferInput,
  CreateOfferInput,
  OfferActionInput,
  ServiceOffer,
} from '@/features/offers/types/offer';
import { offerRepository } from '@/repositories/offer.repository';
import { getUserErrorMessage } from '@/services/api/user-error-message';

const OFFER_ERROR_FALLBACK = 'No se pudo completar la operación con la oferta. Inténtalo de nuevo.';

function mapOfferError(error: unknown): never {
  throw new Error(getUserErrorMessage(error, OFFER_ERROR_FALLBACK));
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
