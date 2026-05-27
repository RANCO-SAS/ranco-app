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
    },
    title: row.title,
    description: row.description,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    categoryName: row.category?.name ?? 'Sin categoría',
    subcategoryName: row.subcategory?.name ?? 'General',
    urgency: row.urgency as ServiceRequestUrgency,
    status: row.status as ServiceRequestStatus,
    assignedProfessionalId: row.assigned_professional_id,
    locationLabel: row.location_label,
    locationLat: row.location_lat,
    locationLng: row.location_lng,
    photoUrls: row.photo_urls ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
