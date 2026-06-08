import { isApiError } from '@/services/api/errors';

export function getUserErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
