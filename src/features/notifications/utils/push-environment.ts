import { isRunningInExpoGo } from 'expo';

export function supportsNativePushNotifications(): boolean {
  return !isRunningInExpoGo();
}
