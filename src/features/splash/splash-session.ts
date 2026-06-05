let hasCompletedSplash = false;

export function isSplashCompletedForSession(): boolean {
  return hasCompletedSplash;
}

export function markSplashCompletedForSession(): void {
  hasCompletedSplash = true;
}
