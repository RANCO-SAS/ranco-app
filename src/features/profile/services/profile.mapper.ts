import type { UserProfileRow } from '@/features/profile/types/profile-db.types';
import type { UserProfile } from '@/features/profile/types/profile.types';

export function mapUserProfileRow(row: UserProfileRow): UserProfile {
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
    onboardingCompletedAt: row.onboarding_completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isProfileOnboardingComplete(profile: UserProfile | null): boolean {
  return Boolean(profile?.onboardingCompletedAt);
}
