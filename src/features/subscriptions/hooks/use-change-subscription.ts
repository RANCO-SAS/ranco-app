import { useMutation, useQueryClient } from '@tanstack/react-query';

import { subscriptionService } from '@/features/subscriptions/services/subscription.service';
import type { ChangeSubscriptionInput } from '@/features/subscriptions/types/subscription';
import { queryKeys } from '@/lib/query-keys';

function invalidateSubscriptionQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  targetRole: ChangeSubscriptionInput['targetRole'],
) {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.subscriptions.byUser(userId, targetRole),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.subscriptions.proStatus(userId, targetRole),
  });
  void queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail(userId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.published });
  void queryClient.invalidateQueries({ queryKey: queryKeys.featuredProfessionals.all });
}

export function useChangeSubscription(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ChangeSubscriptionInput) =>
      subscriptionService.simulateChangeSubscription(input),
    onSuccess: (_subscriptionId, input) => {
      if (!userId) {
        return;
      }

      invalidateSubscriptionQueries(queryClient, userId, input.targetRole);
    },
  });
}
