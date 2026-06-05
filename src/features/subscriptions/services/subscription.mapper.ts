import type {
  SubscriptionPlanRow,
  UserSubscriptionRow,
} from '@/features/subscriptions/types/subscription-db.types';
import type { SubscriptionPlan, UserSubscription } from '@/features/subscriptions/types/subscription';

function parseFeatures(features: string[] | null): string[] {
  if (!features || !Array.isArray(features)) {
    return [];
  }

  return features.filter((item): item is string => typeof item === 'string');
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
