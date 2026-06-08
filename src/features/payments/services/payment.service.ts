import { mapApiServicePayment } from '@/features/payments/services/payment.mapper';
import type {
  ServicePayment,
  SimulateClientPaymentInput,
  SimulateWorkerPayoutInput,
} from '@/features/payments/types/payment';
import { paymentRepository } from '@/repositories/payment.repository';
import { isApiError } from '@/services/api/errors';

async function getServicePaymentByRequestId(
  serviceRequestId: string,
): Promise<ServicePayment | null> {
  try {
    const data = await paymentRepository.getByJobId(serviceRequestId);
    return data ? mapApiServicePayment(data) : null;
  } catch (error) {
    if (isApiError(error) && error.code === 'not_found') {
      return null;
    }

    throw error;
  }
}

async function simulateClientPayment(input: SimulateClientPaymentInput): Promise<string> {
  try {
    const payment = await paymentRepository.simulateClientPayment(input.serviceRequestId, {
      paymentMethodLabel: input.paymentMethodLabel,
    });

    return payment.id;
  } catch (error) {
    if (isApiError(error)) {
      throw new Error(error.message);
    }

    throw error;
  }
}

async function simulateWorkerPayout(input: SimulateWorkerPayoutInput): Promise<string> {
  try {
    const payment = await paymentRepository.simulateWorkerPayout(input.serviceRequestId, {
      bankName: input.bankName,
      accountType: input.accountType,
      accountNumber: input.accountNumber,
      accountHolderName: input.accountHolderName,
    });

    return payment.id;
  } catch (error) {
    if (isApiError(error)) {
      throw new Error(error.message);
    }

    throw error;
  }
}

export const paymentService = {
  getServicePaymentByRequestId,
  simulateClientPayment,
  simulateWorkerPayout,
};
