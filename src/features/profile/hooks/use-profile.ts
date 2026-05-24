import { useQuery } from '@tanstack/react-query';

import { profileService } from '@/features/profile/services/profile.service';
import { queryKeys } from '@/lib/query-keys';

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile.detail(userId ?? 'unknown'),
    queryFn: () => profileService.getProfileByUserId(userId!),
    enabled: Boolean(userId),
  });
}
