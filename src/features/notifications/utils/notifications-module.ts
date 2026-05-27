import Constants from 'expo-constants';
import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

type ExpoNotificationsModule = typeof import('expo-notifications');

export function canUseExpoNotifications(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }

  if (Constants.appOwnership === 'expo') {
    return false;
  }

  return !isRunningInExpoGo();
}

export async function loadExpoNotificationsModule(): Promise<ExpoNotificationsModule | null> {
  if (!canUseExpoNotifications()) {
    return null;
  }

  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}
