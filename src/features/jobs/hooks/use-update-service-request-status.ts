import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateServiceRequestStatusInput } from '@/features/jobs/types/service-request.types';
import { serviceRequestService } from '@/features/jobs/services/service-request.service';
import { queryKeys } from '@/lib/query-keys';

export function useUpdateServiceRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateServiceRequestStatusInput) =>
      serviceRequestService.updateServiceRequestStatus(input),
    onSuccess: (request) => {
      queryClient.setQueryData(queryKeys.jobs.detail(request.id), request);
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
  });
}
