import { useQuery } from '@tanstack/react-query';

import { subscriptionService } from '@/features/subscriptions/services/subscription.service';
import type { SubscriptionTargetRole } from '@/features/subscriptions/types/subscription';
import { queryKeys } from '@/lib/query-keys';

export function useUserSubscription(
  userId: string | undefined,
  targetRole: SubscriptionTargetRole,
) {
  return useQuery({
    queryKey: queryKeys.subscriptions.byUser(userId ?? 'unknown', targetRole),
    queryFn: () => subscriptionService.getUserActiveSubscription(userId!, targetRole),
    enabled: Boolean(userId),
  });
}
