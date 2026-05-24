import type { Session } from '@supabase/supabase-js';

import type { AuthSession } from '@/features/auth/types/auth.types';

function readMetadataString(metadata: Record<string, unknown> | undefined, key: string): string | null {
  const value = metadata?.[key];

  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function mapSupabaseSession(session: Session | null): AuthSession | null {
  if (!session?.user) {
    return null;
  }

  const metadata = session.user.user_metadata;

  return {
    userId: session.user.id,
    email: session.user.email ?? '',
    fullName: readMetadataString(metadata, 'full_name') ?? readMetadataString(metadata, 'name'),
    avatarUrl:
      readMetadataString(metadata, 'avatar_url') ?? readMetadataString(metadata, 'picture'),
  };
}
