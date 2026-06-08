import * as Device from 'expo-device';

import { pushTokenRepository } from '@/repositories/push-token.repository';
import type { PushTokenInput } from '@/features/notifications/types/notification.types';

function resolvePlatform(): PushTokenInput['platform'] {
  if (Device.osName?.toLowerCase() === 'ios') {
    return 'ios';
  }

  if (Device.osName?.toLowerCase() === 'android') {
    return 'android';
  }

  return 'web';
}

export const pushTokenService = {
  async upsertToken(_userId: string, token: string): Promise<void> {
    await pushTokenRepository.register({
      token,
      platform: resolvePlatform(),
      deviceName: Device.modelName ?? undefined,
    });
  },

  async removeToken(_userId: string, _token: string): Promise<void> {
    // Token removal requires the registered token id; re-register overwrites on next login.
  },

  async removeAllTokens(_userId: string): Promise<void> {
    // No bulk unregister endpoint available.
  },
};
