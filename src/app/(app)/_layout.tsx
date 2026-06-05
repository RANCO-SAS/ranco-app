import { Redirect, Stack, usePathname } from 'expo-router';

import { Loader } from '@/components/ui/loader';
import { Routes } from '@/constants/routes';
import { isHybridUser } from '@/features/profile/utils/user-mode';
import { RealtimeNotificationsProvider } from '@/shared/providers/realtime-notifications-provider';
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
  const pathname = usePathname();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAuthHydrated = useAuthStore(selectIsHydrated);
  const isProfileHydrated = useProfileStore(selectIsProfileHydrated);
  const needsOnboarding = useProfileStore(selectNeedsOnboarding);
  const profile = useProfileStore(selectProfile);
  const isAppStoreHydrated = useAppStore(selectHasAppStoreHydrated);
  const pendingModeSelection = useAppStore(selectPendingModeSelection);
  const isOnChooseMode = pathname.includes('choose-mode');

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

  if (profile && isHybridUser(profile) && pendingModeSelection && !isOnChooseMode) {
    return <Redirect href={Routes.app.chooseMode} />;
  }

  return (
    <RealtimeNotificationsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="choose-mode" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="activate-professional" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="jobs/create" />
        <Stack.Screen name="jobs/[id]" />
        <Stack.Screen name="jobs/[id]/pay" />
        <Stack.Screen name="jobs/[id]/payout" />
        <Stack.Screen name="messages/[conversationId]" />
        <Stack.Screen name="users/[userId]" />
        <Stack.Screen name="reviews/[reviewId]" />
        <Stack.Screen name="legal/payment-terms" />
      </Stack>
    </RealtimeNotificationsProvider>
  );
}
