import * as Device from 'expo-device';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { pushTokenService } from '@/features/notifications/services/push-token.service';
import {
  canUseExpoNotifications,
  loadExpoNotificationsModule,
} from '@/features/notifications/utils/notifications-module';

type UsePushRegistrationOptions = {
  userId: string | undefined;
  enabled?: boolean;
};

export function usePushRegistration({ userId, enabled = true }: UsePushRegistrationOptions) {
  const registeredTokenRef = useRef<string | null>(null);
  const isEnabled = enabled && Boolean(userId) && canUseExpoNotifications();

  useEffect(() => {
    if (!isEnabled || !userId) {
      return;
    }

    let isMounted = true;

    async function registerPushToken() {
      if (!Device.isDevice) {
        return;
      }

      const Notifications = await loadExpoNotificationsModule();

      if (!Notifications || !isMounted) {
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      const permissions = await Notifications.getPermissionsAsync();
      let finalStatus = permissions.status;

      if (finalStatus !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        finalStatus = requested.status;
      }

      if (finalStatus !== 'granted') {
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Ranco',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      const tokenResult = await Notifications.getDevicePushTokenAsync();
      const token = tokenResult.data;

      if (!isMounted || !token || token === registeredTokenRef.current) {
        return;
      }

      await pushTokenService.upsertToken(userId, token);
      registeredTokenRef.current = token;
    }

    void registerPushToken();

    return () => {
      isMounted = false;
    };
  }, [isEnabled, userId]);

  useEffect(() => {
    if (!userId) {
      registeredTokenRef.current = null;
    }
  }, [userId]);
}
