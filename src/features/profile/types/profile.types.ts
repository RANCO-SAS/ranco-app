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
  professionalSubcategoryIds: string[];
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InitializeProfileInput = {
  userId: string;
  fullName?: string | null;
  avatarUrl?: string | null;
};

export type CompleteOnboardingInput = {
  userId: string;
  fullName: string;
  phone?: string;
  locationLabel?: string;
  avatarUrl?: string;
  isClient: boolean;
  isProfessional: boolean;
  professionalSubcategoryIds?: string[];
};

export type UpdateProfileInput = {
  fullName?: string;
  phone?: string | null;
  locationLabel?: string | null;
  avatarUrl?: string | null;
  isClient?: boolean;
  isProfessional?: boolean;
  professionalSubcategoryIds?: string[];
};

export type PublicProfileTab = 'summary' | 'reviews' | 'jobs';

export type UserJobHistoryItem = {
  id: string;
  title: string;
  categoryName: string;
  subcategoryName: string;
  completedAt: string;
  role: 'client' | 'professional';
};
