export const SERVICE_REQUEST_STATUS_LABELS = {
  published: 'Publicada',
  in_negotiation: 'En negociación',
  accepted: 'Aceptada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
} as const;

export const SERVICE_REQUEST_URGENCY_LABELS = {
  low: 'Flexible',
  normal: 'Normal',
  high: 'Pronto',
  urgent: 'Urgente',
} as const;
