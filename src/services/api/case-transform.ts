const SNAKE_CASE_PATTERN = /_([a-z])/g;
const CAMEL_CASE_PATTERN = /[A-Z]/g;

export function toSnakeCaseKey(key: string): string {
  return key
    .replace(CAMEL_CASE_PATTERN, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, '');
}

export function toCamelCaseKey(key: string): string {
  return key.replace(SNAKE_CASE_PATTERN, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

export function keysToSnakeCase<T>(value: T): T {
  return transformKeys(value, toSnakeCaseKey);
}

export function keysToCamelCase<T>(value: T): T {
  return transformKeys(value, toCamelCaseKey);
}

function transformKeys<T>(value: T, keyTransform: (key: string) => string): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => transformKeys(item, keyTransform)) as T;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(record)) {
      result[keyTransform(key)] = transformKeys(nestedValue, keyTransform);
    }

    return result as T;
  }

  return value;
}

export function buildSnakeCaseQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') {
      continue;
    }

    searchParams.set(toSnakeCaseKey(key), String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}
