export type ReviewTraitKey =
  | 'quality'
  | 'punctuality'
  | 'communication'
  | 'professionalism'
  | 'clarity'
  | 'respect'
  | 'cooperation';

export type ReviewTraits = Partial<Record<ReviewTraitKey, number>>;

export type ReviewTraitDefinition = {
  key: ReviewTraitKey;
  label: string;
};

export const PROFESSIONAL_REVIEW_TRAITS: ReviewTraitDefinition[] = [
  { key: 'quality', label: 'Calidad del trabajo' },
  { key: 'punctuality', label: 'Puntualidad' },
  { key: 'communication', label: 'Comunicación' },
  { key: 'professionalism', label: 'Profesionalismo' },
];

export const CLIENT_REVIEW_TRAITS: ReviewTraitDefinition[] = [
  { key: 'communication', label: 'Comunicación' },
  { key: 'clarity', label: 'Claridad del encargo' },
  { key: 'respect', label: 'Trato y respeto' },
  { key: 'cooperation', label: 'Cooperación' },
];

export function getReviewTraitsForReviewee(isRevieweeProfessional: boolean): ReviewTraitDefinition[] {
  return isRevieweeProfessional ? PROFESSIONAL_REVIEW_TRAITS : CLIENT_REVIEW_TRAITS;
}

export function buildDefaultTraits(
  definitions: ReviewTraitDefinition[],
  defaultRating = 5,
): ReviewTraits {
  return definitions.reduce<ReviewTraits>((traits, definition) => {
    traits[definition.key] = defaultRating;
    return traits;
  }, {});
}

export function computeAverageRating(traits: ReviewTraits): number {
  const values = Object.values(traits).filter(
    (value): value is number => typeof value === 'number' && value >= 1 && value <= 5,
  );

  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

export function isProfessionalReview(review: { traits: ReviewTraits }): boolean {
  return Boolean(review.traits.quality || review.traits.professionalism || review.traits.punctuality);
}

export function validateTraits(
  traits: ReviewTraits,
  definitions: ReviewTraitDefinition[],
): traits is Record<ReviewTraitKey, number> {
  return definitions.every((definition) => {
    const value = traits[definition.key];
    return typeof value === 'number' && value >= 1 && value <= 5;
  });
}
