import type { ServiceRequest } from '@/features/jobs/types/service-request.types';
import { formatPostedAt } from '@/shared/utils/format-posted-at';

type ServiceRequestTimestamp = {
  icon: 'time-outline' | 'calendar-outline';
  label: string;
};

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatScheduledTime(date: Date): string {
  const now = new Date();
  const timeLabel = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isSameDay(date, now)) {
    return `Hoy, ${timeLabel}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, yesterday)) {
    return `Ayer, ${timeLabel}`;
  }

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatServiceRequestTimestamp(request: ServiceRequest): ServiceRequestTimestamp {
  if (request.status === 'accepted' || request.status === 'in_progress') {
    return {
      icon: 'calendar-outline',
      label: formatScheduledTime(new Date(request.updatedAt)),
    };
  }

  return {
    icon: 'time-outline',
    label: formatPostedAt(request.createdAt),
  };
}
