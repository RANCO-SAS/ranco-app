import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';

const EDITABLE_STATUSES: ServiceRequestStatus[] = ['published', 'in_negotiation'];

export function canClientEditServiceRequest(status: ServiceRequestStatus): boolean {
  return EDITABLE_STATUSES.includes(status);
}
