export type ServiceRequestStatus =
  | 'published'
  | 'in_negotiation'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ServiceRequestUrgency = 'low' | 'normal' | 'high' | 'urgent';

export type ServiceRequestClientPreview = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  isPro: boolean;
};

export type ServiceRequestProfessionalPreview = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
};

export type ServiceRequest = {
  id: string;
  clientId: string;
  client: ServiceRequestClientPreview;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  categoryName: string;
  categorySlug: string;
  subcategoryName: string;
  urgency: ServiceRequestUrgency;
  status: ServiceRequestStatus;
  assignedProfessionalId: string | null;
  assignedProfessional: ServiceRequestProfessionalPreview | null;
  locationLabel: string | null;
  locationLat: number | null;
  locationLng: number | null;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateServiceRequestStatusInput = {
  requestId: string;
  userId: string;
  status: ServiceRequestStatus;
  assignedProfessionalId?: string;
};

export type CreateServiceRequestInput = {
  clientId: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  urgency?: ServiceRequestUrgency;
  locationLabel?: string;
  newPhotoUris?: string[];
};

export type UpdateServiceRequestInput = {
  requestId: string;
  clientId: string;
  title: string;
  description: string;
  urgency: ServiceRequestUrgency;
  locationLabel?: string;
  keptPhotoUrls: string[];
  newPhotoUris: string[];
};
