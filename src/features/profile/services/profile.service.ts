import type {
  CompleteOnboardingInput,
  InitializeProfileInput,
  UpdateProfileInput,
  UserProfile,
} from '@/features/profile/types/profile.types';
import { mapApiUserProfile } from '@/features/profile/services/profile.mapper';
import { professionalAreasService } from '@/features/profile/services/professional-areas.service';
import { profileRepository } from '@/repositories/profile.repository';
import { isApiError } from '@/services/api/errors';

async function getProfessionalSubcategoryIdsForUser(userId: string): Promise<string[]> {
  try {
    const me = await profileRepository.getMe();
    if (me.id !== userId) {
      return [];
    }

    return professionalAreasService.getProfessionalSubcategoryIds(userId);
  } catch {
    return [];
  }
}

async function getProfileByUserId(userId: string): Promise<UserProfile | null> {
  try {
    const profile = await profileRepository.getById(userId);
    const professionalSubcategoryIds = await getProfessionalSubcategoryIdsForUser(userId);

    return mapApiUserProfile(profile, professionalSubcategoryIds);
  } catch (error) {
    if (isApiError(error) && error.code === 'not_found') {
      return null;
    }

    throw error;
  }
}

async function initializeProfile(input: InitializeProfileInput): Promise<UserProfile> {
  const existingProfile = await getProfileByUserId(input.userId);

  if (existingProfile) {
    return existingProfile;
  }

  const profile = await profileRepository.updateMe({
    fullName: input.fullName?.trim() ?? '',
    avatarUrl: input.avatarUrl?.trim() || null,
  });

  return mapApiUserProfile(profile, []);
}

async function completeOnboarding(input: CompleteOnboardingInput): Promise<UserProfile> {
  const profile = await profileRepository.updateMe({
    fullName: input.fullName.trim(),
    phone: input.phone?.trim() || null,
    locationLabel: input.locationLabel?.trim() || null,
    avatarUrl: input.avatarUrl?.trim() || null,
  });

  const onboarded = await profileRepository.completeOnboarding({
    isClient: input.isClient,
    isProfessional: input.isProfessional,
  });

  const professionalSubcategoryIds = input.isProfessional
    ? await professionalAreasService.replaceProfessionalSubcategories(
        input.userId,
        input.professionalSubcategoryIds ?? [],
      )
    : await professionalAreasService.replaceProfessionalSubcategories(input.userId, []);

  return mapApiUserProfile(onboarded ?? profile, professionalSubcategoryIds);
}

async function updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
  const profile = await profileRepository.updateMe({
    fullName: input.fullName?.trim(),
    phone: input.phone,
    locationLabel: input.locationLabel,
    avatarUrl: input.avatarUrl,
  });

  let professionalSubcategoryIds =
    await professionalAreasService.getProfessionalSubcategoryIds(userId);

  if (input.professionalSubcategoryIds !== undefined) {
    professionalSubcategoryIds = await professionalAreasService.replaceProfessionalSubcategories(
      userId,
      input.isProfessional === false ? [] : input.professionalSubcategoryIds,
    );
  } else if (input.isProfessional === false) {
    professionalSubcategoryIds = await professionalAreasService.replaceProfessionalSubcategories(
      userId,
      [],
    );
  }

  return mapApiUserProfile(profile, professionalSubcategoryIds);
}

export const profileService = {
  getProfileByUserId,
  initializeProfile,
  completeOnboarding,
  updateProfile,
};
