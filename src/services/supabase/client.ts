import '@/lib/polyfill-crypto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { AuthError } from '@/features/auth/utils/map-auth-error';
import { env, isSupabaseConfigured } from '@/lib/env';

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    })
  : null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new AuthError(
      'Supabase no está configurado. Agrega EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.',
      'supabase_not_configured',
    );
  }

  return supabase;
}
