export type ServicePaymentStatus =
  | 'awaiting_client_payment'
  | 'paid_pending_payout'
  | 'payout_completed';

export type BankAccountType = 'ahorros' | 'corriente';

export const DEFAULT_PAYMENT_CURRENCY = 'COP' as const;

export type ServicePayment = {
  id: string;
  serviceRequestId: string;
  offerId: string;
  clientId: string;
  professionalId: string;
  amountCents: number;
  clientFeeCents: number;
  workerFeeCents: number;
  clientTotalCents: number;
  platformFeeCents: number;
  payoutCents: number;
  currency: typeof DEFAULT_PAYMENT_CURRENCY;
  status: ServicePaymentStatus;
  paymentMethodLabel: string | null;
  paidAt: string | null;
  bankName: string | null;
  accountType: BankAccountType | null;
  accountNumber: string | null;
  accountHolderName: string | null;
  payoutCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SimulateClientPaymentInput = {
  serviceRequestId: string;
  paymentMethodLabel?: string;
};

export type SimulateWorkerPayoutInput = {
  serviceRequestId: string;
  bankName: string;
  accountType: BankAccountType;
  accountNumber: string;
  accountHolderName: string;
};
