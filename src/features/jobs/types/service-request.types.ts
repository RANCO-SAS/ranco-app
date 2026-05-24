export type ServiceRequestStatus =
  | 'published'
  | 'in_negotiation'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ServiceRequestUrgency = 'low' | 'normal' | 'high' | 'urgent';

export type ServiceRequest = {
  id: string;
  clientId: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  categoryName: string;
  subcategoryName: string;
  urgency: ServiceRequestUrgency;
  status: ServiceRequestStatus;
  assignedProfessionalId: string | null;
  locationLabel: string | null;
  locationLat: number | null;
  locationLng: number | null;
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
  locationLat: number;
  locationLng: number;
};
