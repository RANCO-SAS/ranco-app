import type { Href } from 'expo-router';

import { Routes } from '@/constants/routes';
import { isProfileOnboardingComplete } from '@/features/profile/services/profile.mapper';
import type { UserProfile } from '@/features/profile/types/profile.types';

export function resolveAuthenticatedRoute(profile: UserProfile | null): Href {
  if (!profile || !isProfileOnboardingComplete(profile)) {
    return Routes.onboarding.setup;
  }

  return Routes.app.home;
}
