import type { ServiceRequestRow } from '@/features/jobs/types/service-request-db.types';
import type {
  CreateServiceRequestInput,
  ServiceRequest,
} from '@/features/jobs/types/service-request.types';
import { mapServiceRequestRow } from '@/features/jobs/services/service-request.mapper';
import { getSupabaseClient } from '@/services/supabase/client';

const SERVICE_REQUESTS_TABLE = 'service_requests';

async function getClientRequests(clientId: string): Promise<ServiceRequest[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(SERVICE_REQUESTS_TABLE)
    .select('*')
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
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ServiceRequestRow[]).map(mapServiceRequestRow);
}

async function createServiceRequest(input: CreateServiceRequestInput): Promise<ServiceRequest> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(SERVICE_REQUESTS_TABLE)
    .insert({
      client_id: input.clientId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category.trim(),
      urgency: input.urgency ?? 'normal',
      location_label: input.locationLabel?.trim() || null,
      status: 'published',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapServiceRequestRow(data as ServiceRequestRow);
}

export const serviceRequestService = {
  getClientRequests,
  getPublishedRequests,
  createServiceRequest,
};
