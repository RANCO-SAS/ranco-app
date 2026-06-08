import { apiGet, apiPatch, apiPost } from '@/services/api/client';

export type ApiProfileSummary = {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  isPro?: boolean;
};

export type ApiServiceRequest = {
  id: string;
  clientId: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  urgency: string;
  status: string;
  locationLabel?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  assignedProfessionalId?: string | null;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug: string };
  subcategory?: { id: string; name: string; slug: string };
  client?: ApiProfileSummary;
  assignedProfessional?: ApiProfileSummary;
};

export type CreateServiceRequestBody = {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  urgency: string;
  locationLabel?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  photoUrls: string[];
};

export type UpdateServiceRequestBody = {
  title?: string;
  description?: string;
  urgency?: string;
  locationLabel?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  photoUrls?: string[];
};

export type UpdateServiceRequestStatusBody = {
  status: string;
};

export const serviceRequestRepository = {
  create(body: CreateServiceRequestBody) {
    return apiPost<ApiServiceRequest>('/v1/app/jobs', body);
  },

  getById(requestId: string) {
    return apiGet<ApiServiceRequest>(`/v1/app/jobs/${requestId}`);
  },

  getClientRequests(clientId: string) {
    return apiGet<ApiServiceRequest[]>(`/v1/app/jobs/client/${clientId}`);
  },

  getPublishedRequests() {
    return apiGet<ApiServiceRequest[]>('/v1/app/jobs/published');
  },

  update(requestId: string, body: UpdateServiceRequestBody) {
    return apiPatch<ApiServiceRequest>(`/v1/app/jobs/${requestId}`, body);
  },

  updateStatus(requestId: string, body: UpdateServiceRequestStatusBody) {
    return apiPatch<ApiServiceRequest>(`/v1/app/jobs/${requestId}/status`, body);
  },
};
