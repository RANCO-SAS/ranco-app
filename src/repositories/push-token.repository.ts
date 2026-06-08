import { apiDelete, apiPost } from '@/services/api/client';

export type ApiPushToken = {
  id: string;
  userId: string;
  token: string;
  platform: string;
  deviceName?: string | null;
  lastSeenAt: string;
  createdAt: string;
};

export type RegisterPushTokenBody = {
  token: string;
  platform: string;
  deviceName?: string;
};

export const pushTokenRepository = {
  register(body: RegisterPushTokenBody) {
    return apiPost<ApiPushToken>('/v1/app/push-tokens', body);
  },

  unregister(tokenId: string) {
    return apiDelete<{ ok: boolean }>(`/v1/app/push-tokens/${tokenId}`);
  },
};
