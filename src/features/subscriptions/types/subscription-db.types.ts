import type {
  BillingCycle,
  SubscriptionPlanTier,
  SubscriptionStatus,
  SubscriptionTargetRole,
} from '@/features/subscriptions/types/subscription';

export type SubscriptionPlanRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  target_role: SubscriptionTargetRole;
  tier: SubscriptionPlanTier;
  price_monthly_cents: number;
  price_annual_cents: number;
  features: string[] | null;
  sort_order: number;
};

export type UserSubscriptionRow = {
  subscription_id: string;
  plan_id: string;
  plan_slug: string;
  plan_name: string;
  plan_description: string;
  target_role: SubscriptionTargetRole;
  tier: SubscriptionPlanTier;
  price_monthly_cents: number;
  price_annual_cents: number;
  features: string[] | null;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  current_period_start: string;
  current_period_end: string | null;
};

export type ProStatusRow = {
  user_id: string;
  is_pro: boolean;
};
