import { useQuery } from '@tanstack/react-query';

import { subscriptionService } from '@/features/subscriptions/services/subscription.service';
import type { SubscriptionTargetRole } from '@/features/subscriptions/types/subscription';
import { queryKeys } from '@/lib/query-keys';

export function useSubscriptionPlans(targetRole: SubscriptionTargetRole) {
  return useQuery({
    queryKey: queryKeys.subscriptions.plans(targetRole),
    queryFn: () => subscriptionService.getPlansByRole(targetRole),
  });
}
