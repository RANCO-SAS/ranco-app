import type { UserProfileRow } from '@/features/profile/types/profile-db.types';
import type {
  CompleteOnboardingInput,
  InitializeProfileInput,
  UpdateProfileInput,
  UserProfile,
} from '@/features/profile/types/profile.types';
import { mapUserProfileRow } from '@/features/profile/services/profile.mapper';
import { getSupabaseClient } from '@/services/supabase/client';

const PROFILE_TABLE = 'user_profiles';

async function getProfileByUserId(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapUserProfileRow(data as UserProfileRow);
}

async function initializeProfile(input: InitializeProfileInput): Promise<UserProfile> {
  const existingProfile = await getProfileByUserId(input.userId);

  if (existingProfile) {
    return existingProfile;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .insert({
      id: input.userId,
      full_name: input.fullName?.trim() ?? '',
      avatar_url: input.avatarUrl?.trim() || null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapUserProfileRow(data as UserProfileRow);
}

async function completeOnboarding(input: CompleteOnboardingInput): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .upsert(
      {
        id: input.userId,
        full_name: input.fullName.trim(),
        phone: input.phone?.trim() || null,
        location_label: input.locationLabel?.trim() || null,
        avatar_url: input.avatarUrl?.trim() || null,
        is_client: input.isClient,
        is_professional: input.isProfessional,
        onboarding_completed_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapUserProfileRow(data as UserProfileRow);
}

async function updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  const payload: Partial<UserProfileRow> = {};

  if (input.fullName !== undefined) {
    payload.full_name = input.fullName.trim();
  }

  if (input.phone !== undefined) {
    payload.phone = input.phone?.trim() || null;
  }

  if (input.locationLabel !== undefined) {
    payload.location_label = input.locationLabel?.trim() || null;
  }

  if (input.avatarUrl !== undefined) {
    payload.avatar_url = input.avatarUrl?.trim() || null;
  }

  if (input.isClient !== undefined) {
    payload.is_client = input.isClient;
  }

  if (input.isProfessional !== undefined) {
    payload.is_professional = input.isProfessional;
  }

  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapUserProfileRow(data as UserProfileRow);
}

export const profileService = {
  getProfileByUserId,
  initializeProfile,
  completeOnboarding,
  updateProfile,
};
