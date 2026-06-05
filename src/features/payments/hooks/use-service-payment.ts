import { useQuery } from '@tanstack/react-query';

import { paymentService } from '@/features/payments/services/payment.service';
import { queryKeys } from '@/lib/query-keys';

export function useServicePayment(serviceRequestId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payments.byRequest(serviceRequestId ?? 'unknown'),
    queryFn: () => paymentService.getServicePaymentByRequestId(serviceRequestId!),
    enabled: Boolean(serviceRequestId),
    staleTime: 10_000,
  });
}
