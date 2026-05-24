import type { ServiceCategory } from '@/features/jobs/types/service-category.types';
import {
  CATEGORY_KEYWORDS,
  SUBCATEGORY_KEYWORDS,
} from '@/features/jobs/utils/service-search-keywords';

export type ServiceSearchResult = {
  categoryId: string;
  subcategoryId: string;
  categoryName: string;
  subcategoryName: string;
  categorySlug: string;
  subcategorySlug: string;
  score: number;
  matchedLabel: string;
};

type SearchableEntry = {
  categoryId: string;
  subcategoryId: string;
  categoryName: string;
  subcategoryName: string;
  categorySlug: string;
  subcategorySlug: string;
  terms: string[];
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[\s,.;:/()-]+/)
    .filter((token) => token.length >= 2);
}

function levenshteinDistance(left: string, right: string): number {
  if (left === right) {
    return 0;
  }

  if (left.length === 0) {
    return right.length;
  }

  if (right.length === 0) {
    return left.length;
  }

  const matrix: number[][] = Array.from({ length: left.length + 1 }, () =>
    Array.from({ length: right.length + 1 }, () => 0),
  );

  for (let row = 0; row <= left.length; row += 1) {
    matrix[row][0] = row;
  }

  for (let column = 0; column <= right.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

function fuzzyMatchScore(queryToken: string, candidate: string): number {
  const normalizedQuery = normalizeText(queryToken);
  const normalizedCandidate = normalizeText(candidate);

  if (!normalizedQuery || !normalizedCandidate) {
    return 0;
  }

  if (normalizedCandidate === normalizedQuery) {
    return 1;
  }

  if (normalizedCandidate.includes(normalizedQuery)) {
    return 0.95;
  }

  if (normalizedQuery.includes(normalizedCandidate)) {
    return 0.9;
  }

  const candidateTokens = tokenize(normalizedCandidate);
  for (const candidateToken of candidateTokens) {
    if (candidateToken.includes(normalizedQuery) || normalizedQuery.includes(candidateToken)) {
      return 0.88;
    }
  }

  const maxLength = Math.max(normalizedQuery.length, normalizedCandidate.length);
  const distance = levenshteinDistance(normalizedQuery, normalizedCandidate);
  const similarity = 1 - distance / maxLength;

  const threshold = normalizedQuery.length <= 4 ? 0.72 : 0.78;

  if (similarity >= threshold) {
    return similarity * 0.85;
  }

  for (const candidateToken of candidateTokens) {
    const tokenDistance = levenshteinDistance(normalizedQuery, candidateToken);
    const tokenMax = Math.max(normalizedQuery.length, candidateToken.length);
    const tokenSimilarity = 1 - tokenDistance / tokenMax;

    if (tokenSimilarity >= threshold) {
      return tokenSimilarity * 0.82;
    }
  }

  return 0;
}

function scoreEntry(query: string, entry: SearchableEntry): { score: number; matchedLabel: string } {
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return { score: 0, matchedLabel: entry.subcategoryName };
  }

  let bestScore = 0;
  let matchedLabel = entry.subcategoryName;

  for (const term of entry.terms) {
    for (const queryToken of queryTokens) {
      const score = fuzzyMatchScore(queryToken, term);

      if (score > bestScore) {
        bestScore = score;
        matchedLabel = term;
      }
    }

    const fullQueryScore = fuzzyMatchScore(query, term);

    if (fullQueryScore > bestScore) {
      bestScore = fullQueryScore;
      matchedLabel = term;
    }
  }

  if (bestScore >= 0.85) {
    bestScore += 0.05;
  }

  return { score: Math.min(bestScore, 1), matchedLabel };
}

export function buildServiceSearchIndex(categories: ServiceCategory[]): SearchableEntry[] {
  return categories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      categoryId: category.id,
      subcategoryId: subcategory.id,
      categoryName: category.name,
      subcategoryName: subcategory.name,
      categorySlug: category.slug,
      subcategorySlug: subcategory.slug,
      terms: [
        category.name,
        subcategory.name,
        category.slug,
        subcategory.slug,
        ...(CATEGORY_KEYWORDS[category.slug] ?? []),
        ...(SUBCATEGORY_KEYWORDS[subcategory.slug] ?? []),
      ],
    })),
  );
}

export function searchServiceDomains(
  query: string,
  categories: ServiceCategory[],
  limit = 8,
): ServiceSearchResult[] {
  const normalizedQuery = normalizeText(query);

  if (normalizedQuery.length < 1) {
    return [];
  }

  const index = buildServiceSearchIndex(categories);

  return index
    .map((entry) => {
      const { score, matchedLabel } = scoreEntry(normalizedQuery, entry);

      return {
        categoryId: entry.categoryId,
        subcategoryId: entry.subcategoryId,
        categoryName: entry.categoryName,
        subcategoryName: entry.subcategoryName,
        categorySlug: entry.categorySlug,
        subcategorySlug: entry.subcategorySlug,
        score,
        matchedLabel,
      };
    })
    .filter((result) => result.score >= 0.55)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function getPopularServiceSuggestions(
  categories: ServiceCategory[],
  limit = 6,
): ServiceSearchResult[] {
  return buildServiceSearchIndex(categories)
    .slice(0, limit)
    .map((entry) => ({
      categoryId: entry.categoryId,
      subcategoryId: entry.subcategoryId,
      categoryName: entry.categoryName,
      subcategoryName: entry.subcategoryName,
      categorySlug: entry.categorySlug,
      subcategorySlug: entry.subcategorySlug,
      score: 1,
      matchedLabel: entry.subcategoryName,
    }));
}
