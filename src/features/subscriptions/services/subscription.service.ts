import {
  mapApiSubscriptionPlan,
  mapApiUserSubscription,
} from '@/features/subscriptions/services/subscription.mapper';
import type {
  BillingCycle,
  ChangeSubscriptionInput,
  SubscriptionPlan,
  SubscriptionPlanTier,
  SubscriptionTargetRole,
  UserSubscription,
} from '@/features/subscriptions/types/subscription';
import { subscriptionRepository } from '@/repositories/subscription.repository';

async function getPlansByRole(targetRole: SubscriptionTargetRole): Promise<SubscriptionPlan[]> {
  const data = await subscriptionRepository.getPlansByRole(targetRole);
  return data.map(mapApiSubscriptionPlan);
}

async function getUserActiveSubscription(
  userId: string,
  targetRole: SubscriptionTargetRole,
): Promise<UserSubscription | null> {
  const subscriptions = await subscriptionRepository.getMySubscriptions();
  const match = subscriptions.find((subscription) => subscription.targetRole === targetRole);

  return match ? mapApiUserSubscription(match) : null;
}

async function isUserPro(
  userId: string,
  targetRole: SubscriptionTargetRole,
): Promise<boolean> {
  const subscription = await getUserActiveSubscription(userId, targetRole);
  return subscription?.tier === 'pro' && subscription.status === 'active';
}

async function getProStatusForUsers(
  userIds: string[],
  targetRole: SubscriptionTargetRole,
): Promise<Map<string, boolean>> {
  const statusMap = new Map<string, boolean>();

  for (const userId of userIds) {
    statusMap.set(userId, await isUserPro(userId, targetRole));
  }

  return statusMap;
}

async function simulateChangeSubscription(input: ChangeSubscriptionInput): Promise<string> {
  const billingCycle: BillingCycle =
    input.tier === 'free' ? 'none' : (input.billingCycle ?? 'monthly');

  const subscription = await subscriptionRepository.changePlan({
    targetRole: input.targetRole,
    tier: input.tier,
    billingCycle,
  });

  return subscription.id;
}

export const subscriptionService = {
  getPlansByRole,
  getUserActiveSubscription,
  isUserPro,
  getProStatusForUsers,
  simulateChangeSubscription,
};

export type { SubscriptionPlanTier, SubscriptionTargetRole };
