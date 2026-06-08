type AuthStateChangeEvent =
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY';

type AuthStateListener = (event: AuthStateChangeEvent, session: import('@/features/auth/types/auth.types').AuthSession | null) => void;

const listeners = new Set<AuthStateListener>();

export function emitAuthStateChange(
  event: AuthStateChangeEvent,
  session: import('@/features/auth/types/auth.types').AuthSession | null,
): void {
  listeners.forEach((listener) => listener(event, session));
}

export function subscribeAuthStateChange(listener: AuthStateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
