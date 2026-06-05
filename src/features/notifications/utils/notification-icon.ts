import type { AppIconName } from '@/components/ui/app-icon';
import type { ColorScheme, Colors } from '@/constants/theme';
import type { NotificationType } from '@/features/notifications/types/notification.types';

type Theme = (typeof Colors)[ColorScheme];

type NotificationIconConfig = {
  name: AppIconName;
  background: string;
  color: string;
};

export function getNotificationIconConfig(
  type: NotificationType,
  theme: Theme,
): NotificationIconConfig {
  const configs: Record<NotificationType, NotificationIconConfig> = {
    job_opportunity: {
      name: 'briefcase-outline',
      background: theme.backgroundElement,
      color: theme.primary,
    },
    new_message: {
      name: 'chatbubble-outline',
      background: theme.backgroundElement,
      color: theme.primary,
    },
    new_review: {
      name: 'star-outline',
      background: theme.backgroundElement,
      color: theme.warning,
    },
    job_status: {
      name: 'clipboard-outline',
      background: theme.backgroundElement,
      color: theme.textSecondary,
    },
    new_conversation: {
      name: 'chatbubbles-outline',
      background: theme.backgroundElement,
      color: theme.primary,
    },
    new_offer: {
      name: 'cash-outline',
      background: theme.backgroundElement,
      color: theme.warning,
    },
    offer_accepted: {
      name: 'checkmark-circle-outline',
      background: theme.backgroundElement,
      color: theme.success,
    },
    payment_pending_claim: {
      name: 'wallet-outline',
      background: theme.backgroundElement,
      color: theme.warning,
    },
    payment_completed: {
      name: 'cash-outline',
      background: theme.backgroundElement,
      color: theme.success,
    },
  };

  return configs[type] ?? configs.job_status;
}
