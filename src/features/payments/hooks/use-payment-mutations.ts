import { useMutation, useQueryClient } from '@tanstack/react-query';

import { paymentService } from '@/features/payments/services/payment.service';
import type {
  SimulateClientPaymentInput,
  SimulateWorkerPayoutInput,
} from '@/features/payments/types/payment';
import { queryKeys } from '@/lib/query-keys';

function invalidatePaymentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  serviceRequestId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.payments.byRequest(serviceRequestId),
  });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(serviceRequestId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
}

export function useSimulateClientPayment() {
  return useMutation({
    mutationFn: (input: SimulateClientPaymentInput) => paymentService.simulateClientPayment(input),
  });
}

export function useSimulateWorkerPayout() {
  return useMutation({
    mutationFn: (input: SimulateWorkerPayoutInput) => paymentService.simulateWorkerPayout(input),
  });
}

export function useInvalidatePaymentQueries() {
  const queryClient = useQueryClient();

  return (serviceRequestId: string) => {
    invalidatePaymentQueries(queryClient, serviceRequestId);
  };
}
