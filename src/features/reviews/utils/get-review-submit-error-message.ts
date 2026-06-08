import { getUserErrorMessage } from '@/services/api/user-error-message';

const REVIEW_ERROR_FALLBACK = 'No se pudo publicar la reseña. Intenta de nuevo.';

export function getReviewSubmitErrorMessage(error: unknown): string {
  return getUserErrorMessage(error, REVIEW_ERROR_FALLBACK);
}
