type Env = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    return '';
  }

  return value;
}

export const env: Env = {
  supabaseUrl: getRequiredEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getRequiredEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
};

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
