import { Redirect, Stack } from 'expo-router';

import { Loader } from '@/components/ui/loader';
import { Routes } from '@/constants/routes';
import { selectIsAuthenticated, selectIsHydrated, useAuthStore } from '@/stores/auth-store';
import {
  selectNeedsOnboarding,
  selectIsProfileHydrated,
  useProfileStore,
} from '@/stores/profile-store';

export default function AppLayout() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAuthHydrated = useAuthStore(selectIsHydrated);
  const isProfileHydrated = useProfileStore(selectIsProfileHydrated);
  const needsOnboarding = useProfileStore(selectNeedsOnboarding);

  if (!isAuthHydrated || (isAuthenticated && !isProfileHydrated)) {
    return <Loader message="Cargando..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href={Routes.auth.login} />;
  }

  if (needsOnboarding) {
    return <Redirect href={Routes.onboarding.setup} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="edit-profile" />
    </Stack>
  );
}
