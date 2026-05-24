import { AuthError as SupabaseAuthError } from '@supabase/supabase-js';

export class AuthError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Confirma tu correo antes de iniciar sesión.',
  user_already_registered: 'Este correo ya está registrado.',
  weak_password: 'La contraseña es demasiado débil.',
  over_request_rate_limit: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  validation_failed: 'Revisa los datos ingresados e inténtalo de nuevo.',
  user_not_found: 'No encontramos una cuenta con ese correo.',
  same_password: 'La nueva contraseña debe ser diferente a la anterior.',
  oauth_cancelled: 'Inicio de sesión cancelado.',
  oauth_timeout: 'El inicio de sesión tardó demasiado. Inténtalo de nuevo.',
  oauth_failed: 'No se pudo completar el inicio de sesión.',
  oauth_url_missing: 'No se pudo iniciar el flujo de autenticación.',
  oauth_session_missing: 'No se pudo completar el inicio de sesión.',
};

export function mapAuthError(error: unknown): string {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (error instanceof SupabaseAuthError) {
    const mappedMessage = AUTH_ERROR_MESSAGES[error.code ?? ''];

    if (mappedMessage) {
      return mappedMessage;
    }

    if (error.message.toLowerCase().includes('invalid login credentials')) {
      return AUTH_ERROR_MESSAGES.invalid_credentials;
    }

    return error.message || 'Ocurrió un error de autenticación.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
