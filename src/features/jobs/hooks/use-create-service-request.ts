import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import type { CreateServiceRequestFormData } from '@/features/jobs/schemas/create-service-request.schema';
import { serviceRequestService } from '@/features/jobs/services/service-request.service';
import { Routes } from '@/constants/routes';
import { queryKeys } from '@/lib/query-keys';

type CreateServiceRequestVariables = CreateServiceRequestFormData & {
  clientId: string;
};

export function useCreateServiceRequest() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, ...data }: CreateServiceRequestVariables) =>
      serviceRequestService.createServiceRequest({
        clientId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        urgency: data.urgency,
        locationLabel: data.locationLabel || undefined,
      }),
    onSuccess: (request) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.client(request.clientId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.published });
      router.replace(Routes.app.jobDetail(request.id));
    },
  });
}
