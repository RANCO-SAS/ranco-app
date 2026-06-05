import { useQuery } from '@tanstack/react-query';

import { subscriptionService } from '@/features/subscriptions/services/subscription.service';
import type { SubscriptionTargetRole } from '@/features/subscriptions/types/subscription';
import { queryKeys } from '@/lib/query-keys';

export function useIsUserPro(
  userId: string | undefined,
  targetRole: SubscriptionTargetRole,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.subscriptions.proStatus(userId ?? 'unknown', targetRole),
    queryFn: () => subscriptionService.isUserPro(userId!, targetRole),
    enabled: Boolean(userId) && enabled,
  });
}
