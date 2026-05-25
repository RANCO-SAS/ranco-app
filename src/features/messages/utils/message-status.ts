import type { MessageDeliveryStatus } from '@/features/messages/types/message.types';

export function getMessageDeliveryStatus(message: {
  deliveredAt: string | null;
  readAt: string | null;
}): MessageDeliveryStatus {
  if (message.readAt) {
    return 'read';
  }

  if (message.deliveredAt) {
    return 'delivered';
  }

  return 'sent';
}

export function formatMessageTime(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
