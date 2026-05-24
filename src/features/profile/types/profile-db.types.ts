export type UserProfileRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  location_label: string | null;
  location_lat: number | null;
  location_lng: number | null;
  is_client: boolean;
  is_professional: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};
