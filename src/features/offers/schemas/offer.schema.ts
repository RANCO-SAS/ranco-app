import { z } from 'zod';

export const MIN_OFFER_AMOUNT_COP = 1_000;
export const MAX_OFFER_AMOUNT_COP = 100_000_000;

export const offerAmountSchema = z.object({
  amount: z.coerce
    .number()
    .int('Ingresa un monto en pesos enteros')
    .min(MIN_OFFER_AMOUNT_COP, `Mínimo $${MIN_OFFER_AMOUNT_COP.toLocaleString('es-CO')} COP`)
    .max(MAX_OFFER_AMOUNT_COP, 'Monto demasiado alto'),
});

export type OfferAmountFormData = z.infer<typeof offerAmountSchema>;
