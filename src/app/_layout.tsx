import '@/lib/polyfill-crypto';
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { RootErrorBoundary } from '@/components/layout/root-error-boundary';
import { SystemChrome } from '@/components/layout/system-chrome';
import { SplashGate } from '@/features/splash/components/splash-gate';
import { registerGlobalErrorHandler } from '@/lib/register-global-error-handler';
import { AppProviders } from '@/shared/providers/app-providers';

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: false });

export default function RootLayout() {
  useEffect(() => {
    registerGlobalErrorHandler();
  }, []);

  return (
    <RootErrorBoundary>
      <AppProviders>
        <SplashGate>
          <SystemChrome />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/reset-password" options={{ animation: 'fade' }} />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SplashGate>
      </AppProviders>
    </RootErrorBoundary>
  );
}
