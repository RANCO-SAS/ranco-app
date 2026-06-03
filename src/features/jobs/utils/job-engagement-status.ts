import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';

type EngagementContext = {
  requestId: string;
  userId: string;
  clientId: string;
  professionalId: string;
  professionalName: string;
  status: ServiceRequestStatus;
  assignedProfessionalId: string | null;
  isClient: boolean;
};

export function getJobEngagementStatusMessage(props: EngagementContext): string | null {
  if (props.isClient) {
    if (
      props.assignedProfessionalId &&
      props.assignedProfessionalId !== props.professionalId &&
      props.status !== 'cancelled'
    ) {
      return 'Ya seleccionaste a otro profesional para esta solicitud.';
    }

    if (props.status === 'accepted' && props.assignedProfessionalId === props.professionalId) {
      return `${props.professionalName} fue aceptado. Puedes iniciar el trabajo cuando estén listos.`;
    }

    if (props.status === 'in_negotiation') {
      return `Estás evaluando a ${props.professionalName}. Al aceptarlo, no podrás elegir otro profesional.`;
    }

    if (props.status === 'in_progress' && props.assignedProfessionalId === props.professionalId) {
      return 'El servicio está en curso.';
    }

    if (props.status === 'completed') {
      return 'Puedes dejar una reseña sobre este trabajo.';
    }

    return null;
  }

  if (
    props.assignedProfessionalId &&
    props.assignedProfessionalId !== props.professionalId &&
    props.status !== 'cancelled'
  ) {
    return 'El cliente seleccionó a otro profesional para este trabajo.';
  }

  if (props.status === 'in_negotiation') {
    return 'El cliente aún no te ha seleccionado para este trabajo.';
  }

  if (props.status === 'accepted' && props.userId === props.assignedProfessionalId) {
    return 'Fuiste aceptado. Inicia el trabajo cuando estés listo.';
  }

  if (props.status === 'in_progress' && props.userId === props.assignedProfessionalId) {
    return 'Trabajo en curso.';
  }

  if (props.status === 'completed') {
    return 'Trabajo completado.';
  }

  return null;
}
