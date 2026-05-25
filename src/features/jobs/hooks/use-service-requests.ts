import { useQuery } from '@tanstack/react-query';

import { serviceRequestService } from '@/features/jobs/services/service-request.service';
import { queryKeys } from '@/lib/query-keys';

export function useClientServiceRequests(clientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobs.client(clientId ?? 'unknown'),
    queryFn: () => serviceRequestService.getClientRequests(clientId!),
    enabled: Boolean(clientId),
  });
}

const PUBLISHED_REQUESTS_STALE_MS = 30_000;

export function usePublishedServiceRequests(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.jobs.published,
    queryFn: () => serviceRequestService.getPublishedRequests(),
    enabled,
    staleTime: PUBLISHED_REQUESTS_STALE_MS,
  });
}

export function useServiceRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(requestId ?? 'unknown'),
    queryFn: () => serviceRequestService.getServiceRequestById(requestId!),
    enabled: Boolean(requestId),
  });
}
