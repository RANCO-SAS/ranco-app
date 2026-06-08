import { apiGet, apiPost } from '@/services/api/client';
import { buildSnakeCaseQuery } from '@/services/api/case-transform';

export type ApiSubscriptionPlan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  targetRole: string;
  tier: string;
  priceMonthlyCents: number;
  priceAnnualCents: number;
  features: string[] | Record<string, unknown>;
  sortOrder: number;
  isActive?: boolean;
  createdAt?: string;
};

export type ApiUserSubscription = {
  id: string;
  userId: string;
  planId: string;
  targetRole: string;
  status: string;
  billingCycle: string;
  currentPeriodStart: string;
  currentPeriodEnd?: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: ApiSubscriptionPlan;
};

export type ChangeSubscriptionBody = {
  targetRole: string;
  tier: string;
  billingCycle: string;
};

export const subscriptionRepository = {
  getPlansByRole(targetRole: string) {
    return apiGet<ApiSubscriptionPlan[]>(
      `/v1/app/subscriptions/plans${buildSnakeCaseQuery({ targetRole })}`,
    );
  },

  getMySubscriptions() {
    return apiGet<ApiUserSubscription[]>('/v1/app/subscriptions/me');
  },

  changePlan(body: ChangeSubscriptionBody) {
    return apiPost<ApiUserSubscription>('/v1/app/subscriptions/change', body);
  },
};
