import { useEffect, useState } from 'react';

import { useServicePayment } from '@/features/payments/hooks/use-service-payment';
import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';

const PAYMENT_CREATION_RETRY_MS = 400;
const PAYMENT_CREATION_MAX_RETRIES = 10;

type UseAwaitServicePaymentOptions = {
  serviceRequestId: string | undefined;
  requestStatus: ServiceRequestStatus | undefined;
};

export function useAwaitServicePayment({
  serviceRequestId,
  requestStatus,
}: UseAwaitServicePaymentOptions) {
  const paymentQuery = useServicePayment(serviceRequestId);
  const [retryCount, setRetryCount] = useState(0);

  const expectsPayment = requestStatus === 'completed';
  const paymentMissing = paymentQuery.data === null;
  const canRetryPayment =
    expectsPayment && paymentMissing && !paymentQuery.isError && retryCount < PAYMENT_CREATION_MAX_RETRIES;

  useEffect(() => {
    if (!canRetryPayment || paymentQuery.isFetching || paymentQuery.isLoading) {
      return;
    }

    const timer = setTimeout(() => {
      setRetryCount((current) => current + 1);
      void paymentQuery.refetch();
    }, PAYMENT_CREATION_RETRY_MS);

    return () => clearTimeout(timer);
  }, [
    canRetryPayment,
    paymentQuery.isFetching,
    paymentQuery.isLoading,
    paymentQuery.refetch,
  ]);

  const isResolvingPayment =
    paymentQuery.isLoading ||
    paymentQuery.isFetching ||
    (canRetryPayment && paymentMissing);

  return {
    ...paymentQuery,
    isResolvingPayment,
    paymentExhausted: expectsPayment && paymentMissing && retryCount >= PAYMENT_CREATION_MAX_RETRIES,
  };
}
