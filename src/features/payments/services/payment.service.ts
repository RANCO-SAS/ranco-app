import {
  mapServicePaymentRow,
  type ServicePaymentRow,
} from '@/features/payments/services/payment.mapper';
import type {
  ServicePayment,
  SimulateClientPaymentInput,
  SimulateWorkerPayoutInput,
} from '@/features/payments/types/payment';
import { getSupabaseClient } from '@/services/supabase/client';

const SERVICE_PAYMENTS_TABLE = 'service_payments';

async function getServicePaymentByRequestId(
  serviceRequestId: string,
): Promise<ServicePayment | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(SERVICE_PAYMENTS_TABLE)
    .select('*')
    .eq('service_request_id', serviceRequestId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapServicePaymentRow(data as ServicePaymentRow);
}

async function simulateClientPayment(input: SimulateClientPaymentInput): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('simulate_client_payment', {
    p_service_request_id: input.serviceRequestId,
    p_payment_method_label: input.paymentMethodLabel ?? 'Tarjeta •••• 4242',
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

async function simulateWorkerPayout(input: SimulateWorkerPayoutInput): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('simulate_worker_payout', {
    p_service_request_id: input.serviceRequestId,
    p_bank_name: input.bankName,
    p_account_type: input.accountType,
    p_account_number: input.accountNumber,
    p_account_holder_name: input.accountHolderName,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

export const paymentService = {
  getServicePaymentByRequestId,
  simulateClientPayment,
  simulateWorkerPayout,
};
