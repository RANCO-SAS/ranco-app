import type { Conversation } from '@/features/messages/types/message.types';
import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';

type ComposerLockContext = {
  conversation: Conversation;
  requestStatus: ServiceRequestStatus;
  assignedProfessionalId: string | null;
  userId: string;
};

export type ComposerLockState = {
  locked: boolean;
  message: string | null;
};

export function getComposerLockState({
  conversation,
  requestStatus,
  assignedProfessionalId,
  userId,
}: ComposerLockContext): ComposerLockState {
  if (conversation.closedReason === 'assigned_elsewhere') {
    return {
      locked: true,
      message: 'Esta solicitud fue asignada a otro profesional. Ya no puedes enviar mensajes.',
    };
  }

  if (conversation.closedReason === 'request_cancelled') {
    return {
      locked: true,
      message: 'Esta solicitud fue cancelada. Ya no puedes enviar mensajes.',
    };
  }

  if (
    assignedProfessionalId &&
    assignedProfessionalId !== conversation.professionalId &&
    requestStatus !== 'cancelled' &&
    requestStatus !== 'in_negotiation'
  ) {
    return {
      locked: true,
      message: 'Esta solicitud fue asignada a otro profesional. Ya no puedes enviar mensajes.',
    };
  }

  if (requestStatus === 'in_negotiation') {
    return { locked: false, message: null };
  }

  if (['accepted', 'in_progress', 'completed'].includes(requestStatus)) {
    const isWinningClient = userId === conversation.clientId;
    const isWinningProfessional =
      userId === conversation.professionalId &&
      assignedProfessionalId === conversation.professionalId;

    if (!isWinningClient && !isWinningProfessional) {
      return {
        locked: true,
        message: 'Esta solicitud fue asignada a otro profesional. Ya no puedes enviar mensajes.',
      };
    }
  }

  return { locked: false, message: null };
}
