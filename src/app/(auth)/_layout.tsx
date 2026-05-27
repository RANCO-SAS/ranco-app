import { Redirect, Stack } from 'expo-router';

import { Loader } from '@/components/ui/loader';
import { Routes } from '@/constants/routes';
import { resolveAuthenticatedRoute } from '@/features/profile/utils/resolve-app-route';
import { selectIsAuthenticated, selectIsHydrated, useAuthStore } from '@/stores/auth-store';
import { selectProfile, useProfileStore } from '@/stores/profile-store';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore(selectIsHydrated);
  const profile = useProfileStore(selectProfile);

  if (!isHydrated) {
    return <Loader message="Cargando..." />;
  }

  if (isAuthenticated) {
    return <Redirect href={resolveAuthenticatedRoute(profile)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
