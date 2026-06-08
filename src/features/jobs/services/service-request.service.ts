import type {
  CreateServiceRequestInput,
  ServiceRequest,
  UpdateServiceRequestInput,
  UpdateServiceRequestStatusInput,
} from '@/features/jobs/types/service-request.types';
import type { UserJobHistoryItem } from '@/features/profile/types/profile.types';
import { mapServiceRequestFromApi } from '@/features/jobs/services/service-request.mapper';
import { serviceRequestRepository } from '@/repositories/service-request.repository';
import { profileRepository } from '@/repositories/profile.repository';
import {
  canUserUpdateStatus,
  requiresAssignedProfessional,
} from '@/features/jobs/utils/job-status-transitions';
import { canClientEditServiceRequest } from '@/features/jobs/utils/can-client-edit-service-request';
import { storageService } from '@/services/storage/storage.service';
import { isApiError } from '@/services/api/errors';

async function getClientRequests(clientId: string): Promise<ServiceRequest[]> {
  const data = await serviceRequestRepository.getClientRequests(clientId);
  return data.map(mapServiceRequestFromApi);
}

async function getPublishedRequests(): Promise<ServiceRequest[]> {
  const data = await serviceRequestRepository.getPublishedRequests();
  return data.map(mapServiceRequestFromApi);
}

async function getServiceRequestById(requestId: string): Promise<ServiceRequest | null> {
  try {
    const data = await serviceRequestRepository.getById(requestId);
    return mapServiceRequestFromApi(data);
  } catch (error) {
    if (isApiError(error) && error.code === 'not_found') {
      return null;
    }

    throw error;
  }
}

async function uploadRequestPhotos(
  requestId: string,
  clientId: string,
  photoUris: string[],
  startingIndex = 0,
): Promise<string[]> {
  const uploads = photoUris.map((uri, offset) =>
    storageService.uploadRequestPhoto(clientId, requestId, uri, startingIndex + offset),
  );

  return Promise.all(uploads);
}

async function createServiceRequest(input: CreateServiceRequestInput): Promise<ServiceRequest> {
  const request = await serviceRequestRepository.create({
    title: input.title.trim(),
    description: input.description.trim(),
    categoryId: input.categoryId,
    subcategoryId: input.subcategoryId,
    urgency: input.urgency ?? 'normal',
    locationLabel: input.locationLabel?.trim() || null,
    locationLat: null,
    locationLng: null,
    photoUrls: [],
  });

  const mapped = mapServiceRequestFromApi(request);
  const photoUris = input.newPhotoUris ?? [];

  if (photoUris.length === 0) {
    return mapped;
  }

  if (photoUris.length > storageService.maxRequestPhotos) {
    throw new Error(`Puedes subir hasta ${storageService.maxRequestPhotos} fotos.`);
  }

  const photoUrls = await uploadRequestPhotos(mapped.id, input.clientId, photoUris);
  const updated = await serviceRequestRepository.update(mapped.id, { photoUrls });
  return mapServiceRequestFromApi(updated);
}

async function updateServiceRequest(input: UpdateServiceRequestInput): Promise<ServiceRequest> {
  const current = await getServiceRequestById(input.requestId);

  if (!current) {
    throw new Error('Solicitud no encontrada.');
  }

  if (current.clientId !== input.clientId) {
    throw new Error('No puedes editar esta solicitud.');
  }

  if (!canClientEditServiceRequest(current.status)) {
    throw new Error('Esta solicitud ya no se puede editar.');
  }

  const totalPhotos = input.keptPhotoUrls.length + input.newPhotoUris.length;

  if (totalPhotos > storageService.maxRequestPhotos) {
    throw new Error(`Puedes subir hasta ${storageService.maxRequestPhotos} fotos.`);
  }

  const removedPhotoUrls = current.photoUrls.filter((url) => !input.keptPhotoUrls.includes(url));

  if (removedPhotoUrls.length > 0) {
    await storageService.deleteRequestPhotoUrls(input.requestId, removedPhotoUrls);
  }

  const uploadedPhotoUrls = await uploadRequestPhotos(
    input.requestId,
    input.clientId,
    input.newPhotoUris,
    input.keptPhotoUrls.length,
  );

  const nextPhotoUrls = [...input.keptPhotoUrls, ...uploadedPhotoUrls];

  try {
    const data = await serviceRequestRepository.update(input.requestId, {
      title: input.title.trim(),
      description: input.description.trim(),
      urgency: input.urgency,
      locationLabel: input.locationLabel?.trim() || null,
      photoUrls: nextPhotoUrls,
    });

    return mapServiceRequestFromApi(data);
  } catch (error) {
    if (isApiError(error) && (error.code === 'not_found' || error.code === 'unprocessable')) {
      throw new Error('Esta solicitud ya no se puede editar.');
    }

    throw error;
  }
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

  try {
    const data = await serviceRequestRepository.updateStatus(input.requestId, {
      status: input.status,
    });

    return mapServiceRequestFromApi(data);
  } catch (error) {
    if (isApiError(error) && (error.code === 'forbidden' || error.code === 'unprocessable')) {
      throw new Error('Esta solicitud ya no acepta profesionales.');
    }

    throw error;
  }
}

async function getCompletedJobsForUser(userId: string): Promise<UserJobHistoryItem[]> {
  const data = await profileRepository.getJobHistory(userId);

  return data
    .filter((item) => item.status === 'completed')
    .map((item) => ({
      id: item.id,
      title: item.title,
      categoryName: 'Trabajo',
      subcategoryName: 'General',
      completedAt: item.createdAt,
      role: 'client' as const,
    }));
}

export const serviceRequestService = {
  getClientRequests,
  getPublishedRequests,
  getServiceRequestById,
  createServiceRequest,
  updateServiceRequest,
  updateServiceRequestStatus,
  getCompletedJobsForUser,
};
