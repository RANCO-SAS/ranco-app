export const Routes = {
  root: '/',
  auth: {
    login: '/(auth)/login',
    callback: '/auth/callback',
  },
  onboarding: {
    setup: '/(onboarding)/setup',
  },
  app: {
    home: '/(app)/(tabs)',
    discover: '/(app)/(tabs)/discover',
    jobs: '/(app)/(tabs)/jobs',
    messages: '/(app)/(tabs)/messages',
    profile: '/(app)/(tabs)/profile',
    editProfile: '/(app)/edit-profile',
  },
} as const;
