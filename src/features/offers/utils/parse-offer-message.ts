import type { OfferMessagePayload } from '@/features/offers/types/offer';

export function parseOfferMessageContent(content: string): OfferMessagePayload | null {
  try {
    const parsed = JSON.parse(content) as Partial<OfferMessagePayload>;

    if (
      typeof parsed.offerId !== 'string' ||
      typeof parsed.amountCents !== 'number' ||
      typeof parsed.status !== 'string' ||
      typeof parsed.proposerId !== 'string'
    ) {
      return null;
    }

    return {
      offerId: parsed.offerId,
      amountCents: parsed.amountCents,
      status: parsed.status as OfferMessagePayload['status'],
      proposerId: parsed.proposerId,
      currency: parsed.currency ?? 'COP',
    };
  } catch {
    return null;
  }
}
