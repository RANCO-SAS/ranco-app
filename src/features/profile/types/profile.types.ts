export type UserProfile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  locationLabel: string | null;
  locationLat: number | null;
  locationLng: number | null;
  isClient: boolean;
  isProfessional: boolean;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InitializeProfileInput = {
  userId: string;
  fullName?: string | null;
};

export type CompleteOnboardingInput = {
  userId: string;
  fullName: string;
  phone?: string;
  locationLabel?: string;
  avatarUrl?: string;
  isClient: boolean;
  isProfessional: boolean;
};

export type UpdateProfileInput = {
  fullName?: string;
  phone?: string | null;
  locationLabel?: string | null;
  avatarUrl?: string | null;
  isClient?: boolean;
  isProfessional?: boolean;
};
