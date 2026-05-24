import { Redirect, Stack } from 'expo-router';

import { Loader } from '@/components/ui/loader';
import { Routes } from '@/constants/routes';
import { selectIsAuthenticated, selectIsHydrated, useAuthStore } from '@/stores/auth-store';
import {
  selectIsOnboardingComplete,
  selectIsProfileHydrated,
  useProfileStore,
} from '@/stores/profile-store';

export default function OnboardingLayout() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAuthHydrated = useAuthStore(selectIsHydrated);
  const isProfileHydrated = useProfileStore(selectIsProfileHydrated);
  const isOnboardingComplete = useProfileStore(selectIsOnboardingComplete);

  if (!isAuthHydrated || (isAuthenticated && !isProfileHydrated)) {
    return <Loader message="Cargando..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href={Routes.auth.login} />;
  }

  if (isOnboardingComplete) {
    return <Redirect href={Routes.app.home} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="setup" />
    </Stack>
  );
}
