import type {
  ApiSubscriptionPlan,
  ApiUserSubscription,
} from '@/repositories/subscription.repository';
import type {
  SubscriptionPlanRow,
  UserSubscriptionRow,
} from '@/features/subscriptions/types/subscription-db.types';
import type {
  BillingCycle,
  SubscriptionPlan,
  SubscriptionPlanTier,
  SubscriptionStatus,
  SubscriptionTargetRole,
  UserSubscription,
} from '@/features/subscriptions/types/subscription';

function parseFeatures(features: string[] | Record<string, unknown> | null | undefined): string[] {
  if (!features || !Array.isArray(features)) {
    return [];
  }

  return features.filter((item): item is string => typeof item === 'string');
}

export function mapApiSubscriptionPlan(plan: ApiSubscriptionPlan): SubscriptionPlan {
  return {
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    description: plan.description,
    targetRole: plan.targetRole as SubscriptionTargetRole,
    tier: plan.tier as SubscriptionPlanTier,
    priceMonthlyCents: plan.priceMonthlyCents,
    priceAnnualCents: plan.priceAnnualCents,
    features: parseFeatures(plan.features),
    sortOrder: plan.sortOrder,
  };
}

export function mapApiUserSubscription(subscription: ApiUserSubscription): UserSubscription {
  const plan = subscription.plan;

  return {
    subscriptionId: subscription.id,
    planId: subscription.planId,
    planSlug: plan?.slug ?? '',
    planName: plan?.name ?? '',
    planDescription: plan?.description ?? '',
    targetRole: subscription.targetRole as SubscriptionTargetRole,
    tier: (plan?.tier ?? 'free') as SubscriptionPlanTier,
    priceMonthlyCents: plan?.priceMonthlyCents ?? 0,
    priceAnnualCents: plan?.priceAnnualCents ?? 0,
    features: parseFeatures(plan?.features),
    status: subscription.status as SubscriptionStatus,
    billingCycle: subscription.billingCycle as BillingCycle,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd ?? null,
  };
}

export function mapSubscriptionPlanRow(row: SubscriptionPlanRow): SubscriptionPlan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    targetRole: row.target_role,
    tier: row.tier,
    priceMonthlyCents: row.price_monthly_cents,
    priceAnnualCents: row.price_annual_cents,
    features: parseFeatures(row.features),
    sortOrder: row.sort_order,
  };
}

export function mapUserSubscriptionRow(row: UserSubscriptionRow): UserSubscription {
  return {
    subscriptionId: row.subscription_id,
    planId: row.plan_id,
    planSlug: row.plan_slug,
    planName: row.plan_name,
    planDescription: row.plan_description,
    targetRole: row.target_role,
    tier: row.tier,
    priceMonthlyCents: row.price_monthly_cents,
    priceAnnualCents: row.price_annual_cents,
    features: parseFeatures(row.features),
    status: row.status,
    billingCycle: row.billing_cycle,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
  };
}
