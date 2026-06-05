import {
  mapSubscriptionPlanRow,
  mapUserSubscriptionRow,
} from '@/features/subscriptions/services/subscription.mapper';
import type {
  ProStatusRow,
  SubscriptionPlanRow,
  UserSubscriptionRow,
} from '@/features/subscriptions/types/subscription-db.types';
import type {
  BillingCycle,
  ChangeSubscriptionInput,
  SubscriptionPlan,
  SubscriptionPlanTier,
  SubscriptionTargetRole,
  UserSubscription,
} from '@/features/subscriptions/types/subscription';
import { getSupabaseClient } from '@/services/supabase/client';

const SUBSCRIPTION_PLANS_TABLE = 'subscription_plans';

async function getPlansByRole(targetRole: SubscriptionTargetRole): Promise<SubscriptionPlan[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(SUBSCRIPTION_PLANS_TABLE)
    .select('*')
    .eq('target_role', targetRole)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as SubscriptionPlanRow[]).map(mapSubscriptionPlanRow);
}

async function getUserActiveSubscription(
  userId: string,
  targetRole: SubscriptionTargetRole,
): Promise<UserSubscription | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('get_user_active_subscription', {
    p_user_id: userId,
    p_role: targetRole,
  });

  if (error) {
    throw error;
  }

  const row = (data as UserSubscriptionRow[] | null)?.[0];

  if (!row) {
    return null;
  }

  return mapUserSubscriptionRow(row);
}

async function isUserPro(
  userId: string,
  targetRole: SubscriptionTargetRole,
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('is_user_pro', {
    p_user_id: userId,
    p_role: targetRole,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function getProStatusForUsers(
  userIds: string[],
  targetRole: SubscriptionTargetRole,
): Promise<Map<string, boolean>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('get_pro_status_for_users', {
    p_user_ids: userIds,
    p_role: targetRole,
  });

  if (error) {
    throw error;
  }

  const statusMap = new Map<string, boolean>();

  for (const row of (data ?? []) as ProStatusRow[]) {
    statusMap.set(row.user_id, row.is_pro);
  }

  return statusMap;
}

async function simulateChangeSubscription(input: ChangeSubscriptionInput): Promise<string> {
  const supabase = getSupabaseClient();
  const billingCycle: BillingCycle =
    input.tier === 'free' ? 'none' : (input.billingCycle ?? 'monthly');

  const { data, error } = await supabase.rpc('simulate_change_subscription', {
    p_target_role: input.targetRole,
    p_tier: input.tier,
    p_billing_cycle: billingCycle,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export const subscriptionService = {
  getPlansByRole,
  getUserActiveSubscription,
  isUserPro,
  getProStatusForUsers,
  simulateChangeSubscription,
};

export type { SubscriptionPlanTier, SubscriptionTargetRole };
