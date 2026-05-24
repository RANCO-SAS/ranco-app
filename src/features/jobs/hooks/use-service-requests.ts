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

const PUBLISHED_REQUESTS_REFRESH_MS = 15_000;

export function usePublishedServiceRequests(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.jobs.published,
    queryFn: () => serviceRequestService.getPublishedRequests(),
    enabled,
    refetchInterval: enabled ? PUBLISHED_REQUESTS_REFRESH_MS : false,
    refetchIntervalInBackground: false,
  });
}

export function useServiceRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(requestId ?? 'unknown'),
    queryFn: () => serviceRequestService.getServiceRequestById(requestId!),
    enabled: Boolean(requestId),
  });
}
