import type { ServicePayment } from '@/features/payments/types/payment';

export type ServicePaymentRow = {
  id: string;
  service_request_id: string;
  offer_id: string;
  client_id: string;
  professional_id: string;
  amount_cents: number;
  client_fee_cents: number;
  worker_fee_cents: number;
  client_total_cents: number;
  platform_fee_cents: number;
  payout_cents: number;
  currency: 'COP';
  status: ServicePayment['status'];
  payment_method_label: string | null;
  paid_at: string | null;
  bank_name: string | null;
  account_type: ServicePayment['accountType'];
  account_number: string | null;
  account_holder_name: string | null;
  payout_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export function mapServicePaymentRow(row: ServicePaymentRow): ServicePayment {
  return {
    id: row.id,
    serviceRequestId: row.service_request_id,
    offerId: row.offer_id,
    clientId: row.client_id,
    professionalId: row.professional_id,
    amountCents: row.amount_cents,
    clientFeeCents: row.client_fee_cents,
    workerFeeCents: row.worker_fee_cents,
    clientTotalCents: row.client_total_cents,
    platformFeeCents: row.platform_fee_cents,
    payoutCents: row.payout_cents,
    currency: row.currency,
    status: row.status,
    paymentMethodLabel: row.payment_method_label,
    paidAt: row.paid_at,
    bankName: row.bank_name,
    accountType: row.account_type,
    accountNumber: row.account_number,
    accountHolderName: row.account_holder_name,
    payoutCompletedAt: row.payout_completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
