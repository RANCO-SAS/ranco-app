import * as Device from 'expo-device';

import { getSupabaseClient } from '@/services/supabase/client';

import type { PushTokenInput } from '@/features/notifications/types/notification.types';

const PUSH_TOKENS_TABLE = 'push_tokens';

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
  async upsertToken(userId: string, token: string): Promise<void> {
    const supabase = getSupabaseClient();
    const payload = {
      user_id: userId,
      token,
      platform: resolvePlatform(),
      device_name: Device.modelName ?? undefined,
      last_seen_at: new Date().toISOString(),
    };

    const { error } = await supabase.from(PUSH_TOKENS_TABLE).upsert(payload, {
      onConflict: 'user_id,token',
    });

    if (error) {
      throw error;
    }
  },

  async removeToken(userId: string, token: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from(PUSH_TOKENS_TABLE)
      .delete()
      .eq('user_id', userId)
      .eq('token', token);

    if (error) {
      throw error;
    }
  },

  async removeAllTokens(userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(PUSH_TOKENS_TABLE).delete().eq('user_id', userId);

    if (error) {
      throw error;
    }
  },
};
