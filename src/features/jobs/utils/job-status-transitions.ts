import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';

export type UpdateServiceRequestStatusInput = {
  requestId: string;
  userId: string;
  status: ServiceRequestStatus;
  assignedProfessionalId?: string;
};

const CLIENT_TRANSITIONS: Partial<Record<ServiceRequestStatus, ServiceRequestStatus[]>> = {
  published: ['in_negotiation', 'cancelled'],
  in_negotiation: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
};

const PROFESSIONAL_TRANSITIONS: Partial<Record<ServiceRequestStatus, ServiceRequestStatus[]>> = {
  accepted: ['in_progress'],
  in_progress: ['completed'],
};

function canTransition(
  currentStatus: ServiceRequestStatus,
  nextStatus: ServiceRequestStatus,
  allowedTransitions: Partial<Record<ServiceRequestStatus, ServiceRequestStatus[]>>,
): boolean {
  return allowedTransitions[currentStatus]?.includes(nextStatus) ?? false;
}

export function canUserUpdateStatus(input: {
  currentStatus: ServiceRequestStatus;
  nextStatus: ServiceRequestStatus;
  userId: string;
  clientId: string;
  assignedProfessionalId: string | null;
}): boolean {
  if (input.userId === input.clientId) {
    return canTransition(input.currentStatus, input.nextStatus, CLIENT_TRANSITIONS);
  }

  if (input.userId === input.assignedProfessionalId) {
    return canTransition(input.currentStatus, input.nextStatus, PROFESSIONAL_TRANSITIONS);
  }

  return false;
}

export function requiresAssignedProfessional(nextStatus: ServiceRequestStatus): boolean {
  return nextStatus === 'accepted';
}
