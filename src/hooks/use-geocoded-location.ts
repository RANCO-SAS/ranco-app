import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { geocodeLocationLabel } from '@/shared/location/forward-geocode';

type UseGeocodedLocationOptions = {
  enabled?: boolean;
};

export function useGeocodedLocation(
  label: string | null | undefined,
  options?: UseGeocodedLocationOptions,
) {
  const normalizedLabel = label?.trim() ?? '';

  return useQuery({
    queryKey: queryKeys.location.geocode(normalizedLabel),
    queryFn: () => geocodeLocationLabel(normalizedLabel),
    enabled: (options?.enabled ?? true) && normalizedLabel.length > 0,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}
