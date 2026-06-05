import { DEFAULT_OFFER_CURRENCY } from '@/features/offers/types/offer';

export function formatOfferAmount(
  amountCents: number,
  currency: string = DEFAULT_OFFER_CURRENCY,
): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents);
}

export function parseOfferAmountInput(value: string): number | null {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  const parsed = Number.parseInt(digits, 10);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export function formatOfferAmountInput(value: number | null): string {
  if (value === null || value <= 0) {
    return '';
  }

  return value.toLocaleString('es-CO');
}
