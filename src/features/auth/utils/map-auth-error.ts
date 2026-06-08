import { ApiError } from '@/services/api/errors';
import { getUserErrorMessage } from '@/services/api/user-error-message';

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
  unauthorized: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Confirma tu correo antes de iniciar sesión.',
  user_already_registered: 'Este correo ya está registrado.',
  already_exists: 'Este correo ya está registrado.',
  conflict: 'Este correo ya está registrado.',
  weak_password: 'La contraseña es demasiado débil.',
  validation_error: 'Revisa los datos ingresados e inténtalo de nuevo.',
  over_request_rate_limit: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  validation_failed: 'Revisa los datos ingresados e inténtalo de nuevo.',
  user_not_found: 'No encontramos una cuenta con ese correo.',
  not_found: 'No encontramos una cuenta con ese correo.',
  signup_disabled: 'El registro con correo está deshabilitado.',
  same_password: 'La nueva contraseña debe ser diferente a la anterior.',
  auth_session_missing: 'No se pudo completar la autenticación.',
  invalid_request: 'Solicitud de autenticación inválida. Inténtalo de nuevo.',
  configuration_error: 'La app no está configurada correctamente.',
};

export function mapAuthError(error: unknown): string {
  if (error instanceof AuthError) {
    const mappedMessage = error.code ? AUTH_ERROR_MESSAGES[error.code] : undefined;

    if (mappedMessage) {
      return mappedMessage;
    }

    return error.message;
  }

  if (error instanceof ApiError) {
    if (error.message) {
      return error.message;
    }

    const mappedMessage = AUTH_ERROR_MESSAGES[error.code];
    if (mappedMessage) {
      return mappedMessage;
    }

    return getUserErrorMessage(error, 'Ocurrió un error de autenticación.');
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
