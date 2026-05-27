import { canUseExpoNotifications } from '@/features/notifications/utils/notifications-module';

export function supportsNativePushNotifications(): boolean {
  return canUseExpoNotifications();
}
