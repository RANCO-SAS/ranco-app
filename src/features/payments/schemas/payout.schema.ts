import { z } from 'zod';

import {
  COLOMBIAN_BANKS,
  type ColombianBank,
} from '@/features/payments/constants/colombian-banks';

const bankNameOptions = COLOMBIAN_BANKS as unknown as [ColombianBank, ...ColombianBank[]];

export const payoutSchema = z.object({
  bankName: z.enum(bankNameOptions, {
    message: 'Selecciona un banco válido',
  }),
  accountType: z.enum(['ahorros', 'corriente'], {
    message: 'Selecciona el tipo de cuenta',
  }),
  accountNumber: z
    .string()
    .trim()
    .min(6, 'El número de cuenta debe tener al menos 6 dígitos')
    .max(20, 'Número de cuenta demasiado largo')
    .regex(/^\d+$/, 'Solo se permiten números'),
  accountHolderName: z
    .string()
    .trim()
    .min(3, 'Indica el titular de la cuenta')
    .max(80, 'Nombre demasiado largo'),
});

export type PayoutFormData = z.infer<typeof payoutSchema>;
