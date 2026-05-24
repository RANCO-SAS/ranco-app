import { AuthError as SupabaseAuthError } from '@supabase/supabase-js';

export class ProfileError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ProfileError';
    this.code = code;
  }
}

const PROFILE_ERROR_MESSAGES: Record<string, string> = {
  PGRST116: 'No se encontró el perfil del usuario.',
  '23505': 'El perfil ya existe para este usuario.',
  '42501': 'No tienes permisos para modificar este perfil.',
};

export function mapProfileError(error: unknown): string {
  if (error instanceof ProfileError) {
    return error.message;
  }

  if (error instanceof SupabaseAuthError) {
    const mappedMessage = PROFILE_ERROR_MESSAGES[error.code ?? ''];

    if (mappedMessage) {
      return mappedMessage;
    }

    return error.message || 'Ocurrió un error al procesar el perfil.';
  }

  if (error instanceof Error) {
    if ('code' in error && typeof error.code === 'string') {
      const mappedMessage = PROFILE_ERROR_MESSAGES[error.code];

      if (mappedMessage) {
        return mappedMessage;
      }
    }

    return error.message;
  }

  return 'Ocurrió un error inesperado al procesar el perfil.';
}
