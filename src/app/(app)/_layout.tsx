import { Redirect, Stack } from 'expo-router';

import { Loader } from '@/components/ui/loader';
import { Routes } from '@/constants/routes';
import { isHybridUser } from '@/features/profile/utils/user-mode';
import { selectIsAuthenticated, selectIsHydrated, useAuthStore } from '@/stores/auth-store';
import {
  selectHasAppStoreHydrated,
  selectPendingModeSelection,
  useAppStore,
} from '@/stores/app-store';
import {
  selectNeedsOnboarding,
  selectIsProfileHydrated,
  selectProfile,
  useProfileStore,
} from '@/stores/profile-store';

export default function AppLayout() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAuthHydrated = useAuthStore(selectIsHydrated);
  const isProfileHydrated = useProfileStore(selectIsProfileHydrated);
  const needsOnboarding = useProfileStore(selectNeedsOnboarding);
  const profile = useProfileStore(selectProfile);
  const isAppStoreHydrated = useAppStore(selectHasAppStoreHydrated);
  const pendingModeSelection = useAppStore(selectPendingModeSelection);

  if (
    !isAuthHydrated ||
    (isAuthenticated && !isProfileHydrated) ||
    (isAuthenticated && !isAppStoreHydrated)
  ) {
    return <Loader message="Cargando..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href={Routes.auth.login} />;
  }

  if (needsOnboarding) {
    return <Redirect href={Routes.onboarding.setup} />;
  }

  if (profile && isHybridUser(profile) && pendingModeSelection) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Redirect href={Routes.app.chooseMode} />
        <Stack.Screen name="choose-mode" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="choose-mode" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="activate-professional" />
      <Stack.Screen name="jobs/create" />
      <Stack.Screen name="jobs/[id]" />
      <Stack.Screen name="messages/[conversationId]" />
      <Stack.Screen name="users/[userId]" />
    </Stack>
  );
}
