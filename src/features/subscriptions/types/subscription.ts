export type SubscriptionTargetRole = 'client' | 'professional';

export type SubscriptionPlanTier = 'free' | 'pro';

export type SubscriptionStatus = 'active' | 'cancelled';

export type BillingCycle = 'none' | 'monthly' | 'annual';

export type SubscriptionPlan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  targetRole: SubscriptionTargetRole;
  tier: SubscriptionPlanTier;
  priceMonthlyCents: number;
  priceAnnualCents: number;
  features: string[];
  sortOrder: number;
};

export type UserSubscription = {
  subscriptionId: string;
  planId: string;
  planSlug: string;
  planName: string;
  planDescription: string;
  targetRole: SubscriptionTargetRole;
  tier: SubscriptionPlanTier;
  priceMonthlyCents: number;
  priceAnnualCents: number;
  features: string[];
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
};

export type ChangeSubscriptionInput = {
  targetRole: SubscriptionTargetRole;
  tier: SubscriptionPlanTier;
  billingCycle?: BillingCycle;
};
