import type { ServiceRequestRow } from '@/features/jobs/types/service-request-db.types';
import type {
  ServiceRequest,
  ServiceRequestStatus,
  ServiceRequestUrgency,
} from '@/features/jobs/types/service-request.types';

export function mapServiceRequestRow(row: ServiceRequestRow): ServiceRequest {
  return {
    id: row.id,
    clientId: row.client_id,
    client: {
      id: row.client?.id ?? row.client_id,
      fullName: row.client?.full_name?.trim() || 'Cliente',
      avatarUrl: row.client?.avatar_url ?? null,
      isPro: false,
    },
    title: row.title,
    description: row.description,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    categoryName: row.category?.name ?? 'Sin categoría',
    categorySlug: row.category?.slug ?? 'other',
    subcategoryName: row.subcategory?.name ?? 'General',
    urgency: row.urgency as ServiceRequestUrgency,
    status: row.status as ServiceRequestStatus,
    assignedProfessionalId: row.assigned_professional_id,
    assignedProfessional: row.assigned_professional
      ? {
          id: row.assigned_professional.id,
          fullName: row.assigned_professional.full_name?.trim() || 'Profesional',
          avatarUrl: row.assigned_professional.avatar_url ?? null,
        }
      : null,
    locationLabel: row.location_label,
    locationLat: row.location_lat,
    locationLng: row.location_lng,
    photoUrls: row.photo_urls ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
