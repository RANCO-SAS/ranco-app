import type { UserProfile } from '@/features/profile/types/profile.types';
import { apiGet, apiPatch, apiPost } from '@/services/api/client';

export type ApiUserProfile = Omit<UserProfile, 'professionalSubcategoryIds'> & {
  isPro?: boolean;
};

export type ApiJobHistoryItem = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
};

export type UpdateProfileBody = {
  fullName?: string;
  avatarUrl?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
};

export type CompleteOnboardingBody = {
  isClient: boolean;
  isProfessional: boolean;
};

export const profileRepository = {
  getMe() {
    return apiGet<ApiUserProfile>('/v1/app/profile/me');
  },

  getById(userId: string) {
    return apiGet<ApiUserProfile>(`/v1/app/users/${userId}`);
  },

  updateMe(body: UpdateProfileBody) {
    return apiPatch<ApiUserProfile>('/v1/app/profile/me', body);
  },

  completeOnboarding(body: CompleteOnboardingBody) {
    return apiPost<ApiUserProfile>('/v1/app/profile/onboarding', body);
  },

  getJobHistory(userId: string) {
    return apiGet<ApiJobHistoryItem[]>(`/v1/app/users/${userId}/jobs`);
  },
};
