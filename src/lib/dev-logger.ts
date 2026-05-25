type DevLogData = Record<string, unknown> | unknown[] | string | number | boolean | null;

function serializeError(error: unknown): DevLogData {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'object' && error !== null) {
    return error as Record<string, unknown>;
  }

  return { value: error };
}

export function devLog(scope: string, message: string, data?: DevLogData): void {
  if (!__DEV__) {
    return;
  }

  if (data !== undefined) {
    console.info(`[${scope}] ${message}`, data);
    return;
  }

  console.info(`[${scope}] ${message}`);
}

export function devWarn(scope: string, message: string, data?: DevLogData): void {
  if (!__DEV__) {
    return;
  }

  if (data !== undefined) {
    console.warn(`[${scope}] ${message}`, data);
    return;
  }

  console.warn(`[${scope}] ${message}`);
}

export function devError(scope: string, message: string, error?: unknown, data?: DevLogData): void {
  if (!__DEV__) {
    return;
  }

  console.error(`[${scope}] ${message}`, {
    ...(data !== undefined ? { data } : {}),
    error: error !== undefined ? serializeError(error) : undefined,
  });
}
