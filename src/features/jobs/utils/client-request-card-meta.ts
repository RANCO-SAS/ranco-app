import {
  SERVICE_REQUEST_STATUS_LABELS,
  SERVICE_REQUEST_URGENCY_LABELS,
} from '@/features/jobs/constants/service-request-labels';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';
import type { BadgeTone } from '@/shared/utils/badge-colors';

type RequestStatusBadge = {
  label: string;
  tone: BadgeTone;
  showDot: boolean;
};

type RequestAssignmentFooter =
  | {
      type: 'searching';
      label: string;
    }
  | {
      type: 'professional';
      label: string;
      fullName: string;
      avatarUrl: string | null;
    };

function formatShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'Profesional';
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts[0]} ${parts[1].charAt(0)}.`;
}

export function getRequestStatusBadge(request: ServiceRequest): RequestStatusBadge {
  if (request.urgency === 'urgent' && request.status === 'published') {
    return {
      label: SERVICE_REQUEST_URGENCY_LABELS.urgent,
      tone: 'warning',
      showDot: true,
    };
  }

  if (request.status === 'in_progress') {
    return {
      label: 'En curso',
      tone: 'warning',
      showDot: true,
    };
  }

  if (request.status === 'in_negotiation') {
    return {
      label: SERVICE_REQUEST_STATUS_LABELS.in_negotiation,
      tone: 'info',
      showDot: true,
    };
  }

  if (request.status === 'accepted') {
    return {
      label: 'Confirmada',
      tone: 'success',
      showDot: true,
    };
  }

  if (request.status === 'completed') {
    return {
      label: SERVICE_REQUEST_STATUS_LABELS.completed,
      tone: 'success',
      showDot: false,
    };
  }

  if (request.status === 'cancelled') {
    return {
      label: SERVICE_REQUEST_STATUS_LABELS.cancelled,
      tone: 'neutral',
      showDot: false,
    };
  }

  if (request.urgency === 'high') {
    return {
      label: SERVICE_REQUEST_URGENCY_LABELS.high,
      tone: 'info',
      showDot: true,
    };
  }

  return {
    label: SERVICE_REQUEST_STATUS_LABELS.published,
    tone: 'neutral',
    showDot: false,
  };
}

export function getRequestAssignmentFooter(
  request: ServiceRequest,
): RequestAssignmentFooter | null {
  if (request.assignedProfessional) {
    const shortName = formatShortName(request.assignedProfessional.fullName);
    const suffix =
      request.status === 'in_progress'
        ? 'en camino'
        : request.status === 'accepted'
          ? 'confirmado'
          : 'asignado';

    return {
      type: 'professional',
      label: `${shortName} ${suffix}`,
      fullName: request.assignedProfessional.fullName,
      avatarUrl: request.assignedProfessional.avatarUrl,
    };
  }

  if (request.status === 'published' || request.status === 'in_negotiation') {
    return {
      type: 'searching',
      label: 'Buscando profesional',
    };
  }

  return null;
}
