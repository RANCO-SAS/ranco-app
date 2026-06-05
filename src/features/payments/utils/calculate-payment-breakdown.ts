import {
  CLIENT_SERVICE_FEE_RATE,
  WORKER_SERVICE_FEE_RATE,
} from '@/features/payments/constants/platform-fee';

export type PaymentBreakdown = {
  agreedAmountCents: number;
  clientFeeCents: number;
  workerFeeCents: number;
  platformFeeCents: number;
  clientTotalCents: number;
  payoutCents: number;
};

export function calculatePaymentBreakdown(amountCents: number): PaymentBreakdown {
  const clientFeeCents = Math.round(amountCents * CLIENT_SERVICE_FEE_RATE);
  const workerFeeCents = Math.round(amountCents * WORKER_SERVICE_FEE_RATE);

  return {
    agreedAmountCents: amountCents,
    clientFeeCents,
    workerFeeCents,
    platformFeeCents: clientFeeCents + workerFeeCents,
    clientTotalCents: amountCents + clientFeeCents,
    payoutCents: amountCents - workerFeeCents,
  };
}
