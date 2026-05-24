import type { UserProfile } from '@/features/profile/types/profile.types';
import type { UserMode } from '@/types';

export function isHybridUser(profile: UserProfile | null): boolean {
  return Boolean(profile?.isClient && profile?.isProfessional);
}

export function isModeAllowedForProfile(profile: UserProfile, mode: UserMode): boolean {
  if (mode === 'client') {
    return profile.isClient;
  }

  return profile.isProfessional;
}

export function resolveImplicitMode(profile: UserProfile): UserMode {
  if (profile.isClient) {
    return 'client';
  }

  return 'professional';
}

export function resolveActiveMode(
  profile: UserProfile | null,
  storedMode: UserMode,
): UserMode {
  if (!profile) {
    return storedMode;
  }

  if (!isHybridUser(profile)) {
    return resolveImplicitMode(profile);
  }

  if (isModeAllowedForProfile(profile, storedMode)) {
    return storedMode;
  }

  return 'client';
}

export function shouldShowJobsTab(profile: UserProfile | null, activeMode: UserMode): boolean {
  return Boolean(profile?.isClient && activeMode === 'client');
}

export function shouldShowDiscoverTab(
  profile: UserProfile | null,
  activeMode: UserMode,
): boolean {
  return Boolean(profile?.isProfessional && activeMode === 'professional');
}
