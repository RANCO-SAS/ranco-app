import type { ServiceRequestRow } from '@/features/jobs/types/service-request-db.types';
import type {
  CreateServiceRequestInput,
  ServiceRequest,
  UpdateServiceRequestStatusInput,
} from '@/features/jobs/types/service-request.types';
import type { UserJobHistoryItem } from '@/features/profile/types/profile.types';
import { mapServiceRequestRow } from '@/features/jobs/services/service-request.mapper';
import {
  canUserUpdateStatus,
  requiresAssignedProfessional,
} from '@/features/jobs/utils/job-status-transitions';
import { getSupabaseClient } from '@/services/supabase/client';

const SERVICE_REQUESTS_TABLE = 'service_requests';

const SERVICE_REQUEST_SELECT = `
  *,
  category:service_categories ( id, name, slug ),
  subcategory:service_subcategories ( id, name, slug ),
  client:user_profiles!client_id ( id, full_name, avatar_url )
`;

async function getClientRequests(clientId: string): Promise<ServiceRequest[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(SERVICE_REQUESTS_TABLE)
    .select(SERVICE_REQUEST_SELECT)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ServiceRequestRow[]).map(mapServiceRequestRow);
}

async function getPublishedRequests(): Promise<ServiceRequest[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(SERVICE_REQUESTS_TABLE)
    .select(SERVICE_REQUEST_SELECT)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ServiceRequestRow[]).map(mapServiceRequestRow);
}

async function getServiceRequestById(requestId: string): Promise<ServiceRequest | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(SERVICE_REQUESTS_TABLE)
    .select(SERVICE_REQUEST_SELECT)
    .eq('id', requestId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapServiceRequestRow(data as ServiceRequestRow);
}

async function createServiceRequest(input: CreateServiceRequestInput): Promise<ServiceRequest> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(SERVICE_REQUESTS_TABLE)
    .insert({
      client_id: input.clientId,
      title: input.title.trim(),
      description: input.description.trim(),
      category_id: input.categoryId,
      subcategory_id: input.subcategoryId,
      urgency: input.urgency ?? 'normal',
      location_label: input.locationLabel?.trim() || null,
      location_lat: null,
      location_lng: null,
      status: 'published',
    })
    .select(SERVICE_REQUEST_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapServiceRequestRow(data as ServiceRequestRow);
}

async function updateServiceRequestStatus(
  input: UpdateServiceRequestStatusInput,
): Promise<ServiceRequest> {
  const current = await getServiceRequestById(input.requestId);

  if (!current) {
    throw new Error('Solicitud no encontrada.');
  }

  const assignedProfessionalId =
    input.assignedProfessionalId ?? current.assignedProfessionalId ?? null;

  if (
    !canUserUpdateStatus({
      currentStatus: current.status,
      nextStatus: input.status,
      userId: input.userId,
      clientId: current.clientId,
      assignedProfessionalId,
    })
  ) {
    throw new Error('No puedes cambiar el estado de esta solicitud.');
  }

  if (requiresAssignedProfessional(input.status) && !assignedProfessionalId) {
    throw new Error('Debes asignar un profesional antes de aceptar la solicitud.');
  }

  if (
    input.status === 'accepted' &&
    current.assignedProfessionalId &&
    assignedProfessionalId &&
    current.assignedProfessionalId !== assignedProfessionalId
  ) {
    throw new Error('Esta solicitud ya tiene un profesional asignado.');
  }

  if (
    input.status === 'accepted' &&
    current.status !== 'in_negotiation' &&
    current.status !== 'accepted'
  ) {
    throw new Error('Esta solicitud ya no acepta profesionales.');
  }

  const supabase = getSupabaseClient();
  let query = supabase
    .from(SERVICE_REQUESTS_TABLE)
    .update({
      status: input.status,
      assigned_professional_id: assignedProfessionalId,
    })
    .eq('id', input.requestId);

  if (input.status === 'accepted') {
    query = query.eq('status', 'in_negotiation');
  }

  const { data, error } = await query.select(SERVICE_REQUEST_SELECT).single();

  if (error?.code === 'PGRST116') {
    throw new Error('Esta solicitud ya no acepta profesionales.');
  }

  if (error) {
    throw error;
  }

  return mapServiceRequestRow(data as ServiceRequestRow);
}

async function getCompletedJobsForUser(userId: string): Promise<UserJobHistoryItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(SERVICE_REQUESTS_TABLE)
    .select(SERVICE_REQUEST_SELECT)
    .eq('status', 'completed')
    .or(`client_id.eq.${userId},assigned_professional_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ServiceRequestRow[]).map((row) => {
    const mapped = mapServiceRequestRow(row);
    const role = mapped.clientId === userId ? 'client' : 'professional';

    return {
      id: mapped.id,
      title: mapped.title,
      categoryName: mapped.categoryName,
      subcategoryName: mapped.subcategoryName,
      completedAt: mapped.updatedAt,
      role,
    };
  });
}

export const serviceRequestService = {
  getClientRequests,
  getPublishedRequests,
  getServiceRequestById,
  createServiceRequest,
  updateServiceRequestStatus,
  getCompletedJobsForUser,
};
