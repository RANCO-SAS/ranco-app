import { apiGet, apiPost } from '@/services/api/client';

export type ApiServicePayment = {
  id: string;
  serviceRequestId: string;
  offerId: string;
  clientId: string;
  professionalId: string;
  amountCents: number;
  platformFeeCents: number;
  payoutCents: number;
  currency: string;
  status: string;
  paymentMethodLabel?: string | null;
  paidAt?: string | null;
  bankName?: string | null;
  accountType?: string | null;
  accountNumber?: string | null;
  accountHolderName?: string | null;
  payoutCompletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SimulateClientPaymentBody = {
  paymentMethodLabel?: string;
};

export type SimulateWorkerPayoutBody = {
  bankName: string;
  accountType: string;
  accountNumber: string;
  accountHolderName: string;
};

export const paymentRepository = {
  getByJobId(jobId: string) {
    return apiGet<ApiServicePayment | null>(`/v1/app/jobs/${jobId}/payment`);
  },

  simulateClientPayment(jobId: string, body: SimulateClientPaymentBody) {
    return apiPost<ApiServicePayment>(`/v1/app/jobs/${jobId}/payment/simulate-client`, body);
  },

  simulateWorkerPayout(jobId: string, body: SimulateWorkerPayoutBody) {
    return apiPost<ApiServicePayment>(`/v1/app/jobs/${jobId}/payment/simulate-payout`, body);
  },
};
