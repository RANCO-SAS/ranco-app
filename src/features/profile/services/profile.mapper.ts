import type { ApiUserProfile } from '@/repositories/profile.repository';
import type { UserProfileRow } from '@/features/profile/types/profile-db.types';
import type { UserProfile } from '@/features/profile/types/profile.types';

export function mapUserProfileRow(
  row: UserProfileRow,
  professionalSubcategoryIds: string[] = [],
): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    locationLabel: row.location_label,
    locationLat: row.location_lat,
    locationLng: row.location_lng,
    isClient: row.is_client,
    isProfessional: row.is_professional,
    professionalSubcategoryIds,
    onboardingCompletedAt: row.onboarding_completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapApiUserProfile(
  profile: ApiUserProfile,
  professionalSubcategoryIds: string[] = [],
): UserProfile {
  return {
    id: profile.id,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl ?? null,
    phone: profile.phone ?? null,
    locationLabel: profile.locationLabel ?? null,
    locationLat: profile.locationLat ?? null,
    locationLng: profile.locationLng ?? null,
    isClient: profile.isClient,
    isProfessional: profile.isProfessional,
    professionalSubcategoryIds,
    onboardingCompletedAt: profile.onboardingCompletedAt ?? null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export function isProfileOnboardingComplete(profile: UserProfile | null): boolean {
  return Boolean(profile?.onboardingCompletedAt);
}
