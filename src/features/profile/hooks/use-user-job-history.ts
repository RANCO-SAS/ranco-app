import { useQuery } from '@tanstack/react-query';

import { serviceRequestService } from '@/features/jobs/services/service-request.service';
import { queryKeys } from '@/lib/query-keys';

export function useUserJobHistory(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobs.completedHistory(userId ?? 'unknown'),
    queryFn: () => serviceRequestService.getCompletedJobsForUser(userId!),
    enabled: Boolean(userId),
  });
}
