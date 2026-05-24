import type { Session } from '@supabase/supabase-js';

import type { AuthSession } from '@/features/auth/types/auth.types';

export function mapSupabaseSession(session: Session | null): AuthSession | null {
  if (!session?.user) {
    return null;
  }

  const fullName = session.user.user_metadata?.full_name;

  return {
    userId: session.user.id,
    email: session.user.email ?? '',
    fullName: typeof fullName === 'string' ? fullName : null,
  };
}
