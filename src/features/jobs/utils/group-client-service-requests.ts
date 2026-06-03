import type { ServiceRequest, ServiceRequestStatus } from '@/features/jobs/types/service-request.types';

export type ClientRequestTab = 'active' | 'scheduled' | 'history';

const ACTIVE_STATUSES: ServiceRequestStatus[] = ['published', 'in_negotiation', 'in_progress'];
const SCHEDULED_STATUSES: ServiceRequestStatus[] = ['accepted'];
const HISTORY_STATUSES: ServiceRequestStatus[] = ['completed', 'cancelled'];

export function filterClientRequestsByTab(
  requests: ServiceRequest[],
  tab: ClientRequestTab,
): ServiceRequest[] {
  switch (tab) {
    case 'active':
      return requests.filter((request) => ACTIVE_STATUSES.includes(request.status));
    case 'scheduled':
      return requests.filter((request) => SCHEDULED_STATUSES.includes(request.status));
    case 'history':
      return requests.filter((request) => HISTORY_STATUSES.includes(request.status));
    default:
      return requests;
  }
}

export function countClientRequestsByTab(
  requests: ServiceRequest[],
  tab: ClientRequestTab,
): number {
  return filterClientRequestsByTab(requests, tab).length;
}
