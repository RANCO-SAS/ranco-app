import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import type { UpdateServiceRequestFormData } from '@/features/jobs/schemas/update-service-request.schema';
import { serviceRequestService } from '@/features/jobs/services/service-request.service';
import { splitServiceRequestPhotos } from '@/features/jobs/types/service-request-photo.types';
import type { ServiceRequestPhotoItem } from '@/features/jobs/types/service-request-photo.types';
import { Routes } from '@/constants/routes';
import { queryKeys } from '@/lib/query-keys';

type UpdateServiceRequestVariables = UpdateServiceRequestFormData & {
  requestId: string;
  clientId: string;
  photos: ServiceRequestPhotoItem[];
};

export function useUpdateServiceRequest() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, clientId, photos, ...data }: UpdateServiceRequestVariables) => {
      const { keptPhotoUrls, newPhotoUris } = splitServiceRequestPhotos(photos);

      return serviceRequestService.updateServiceRequest({
        requestId,
        clientId,
        title: data.title,
        description: data.description,
        urgency: data.urgency,
        locationLabel: data.locationLabel || undefined,
        keptPhotoUrls,
        newPhotoUris,
      });
    },
    onSuccess: (request) => {
      queryClient.setQueryData(queryKeys.jobs.detail(request.id), request);
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      router.replace(Routes.app.jobDetail(request.id));
    },
  });
}
