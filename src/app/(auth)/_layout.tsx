import { Redirect, Stack } from 'expo-router';

import { Loader } from '@/components/ui/loader';
import { Routes } from '@/constants/routes';
import { selectIsAuthenticated, selectIsHydrated, useAuthStore } from '@/stores/auth-store';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore(selectIsHydrated);

  if (!isHydrated) {
    return <Loader message="Cargando..." />;
  }

  if (isAuthenticated) {
    return <Redirect href={Routes.root} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
