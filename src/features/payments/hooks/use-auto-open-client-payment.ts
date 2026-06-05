import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { Routes } from '@/constants/routes';
import type { ServicePaymentStatus } from '@/features/payments/types/payment';
import {
  markPaymentScreenOpened,
  shouldAutoOpenPayment,
} from '@/features/payments/payment-prompt-session';
import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';

type UseAutoOpenClientPaymentOptions = {
  serviceRequestId: string | undefined;
  requestStatus: ServiceRequestStatus | undefined;
  paymentStatus: ServicePaymentStatus | null | undefined;
  isClient: boolean;
  enabled?: boolean;
};

export function useAutoOpenClientPayment({
  serviceRequestId,
  requestStatus,
  paymentStatus,
  isClient,
  enabled = true,
}: UseAutoOpenClientPaymentOptions) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled || !serviceRequestId || !isClient) {
      return;
    }

    if (requestStatus !== 'completed') {
      return;
    }

    if (paymentStatus !== 'awaiting_client_payment') {
      return;
    }

    if (!shouldAutoOpenPayment(serviceRequestId)) {
      return;
    }

    markPaymentScreenOpened(serviceRequestId);
    router.push(Routes.app.payJob(serviceRequestId));
  }, [enabled, isClient, paymentStatus, requestStatus, router, serviceRequestId]);
}
