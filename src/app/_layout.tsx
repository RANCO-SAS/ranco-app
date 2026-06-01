import '@/lib/polyfill-crypto';
import 'react-native-reanimated';

import { Stack } from 'expo-router';

import { SystemChrome } from '@/components/layout/system-chrome';
import { AppProviders } from '@/shared/providers/app-providers';

export default function RootLayout() {
  return (
    <AppProviders>
      <SystemChrome />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/reset-password" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  );
}
