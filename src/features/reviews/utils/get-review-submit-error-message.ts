export function getReviewSubmitErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'No se pudo publicar la reseña. Intenta de nuevo.';
  }

  const message = error.message.toLowerCase();

  if (message.includes('duplicate') || message.includes('unique')) {
    return 'Ya publicaste una reseña para este trabajo.';
  }

  if (message.includes('row-level security') || message.includes('permission')) {
    return 'No tienes permiso para publicar esta reseña.';
  }

  if (message.includes('integer') || message.includes('rating')) {
    return 'La valoración no es válida. Revisa las categorías e intenta de nuevo.';
  }

  return error.message || 'No se pudo publicar la reseña. Intenta de nuevo.';
}
