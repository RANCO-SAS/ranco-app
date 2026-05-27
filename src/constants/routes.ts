import type { Href } from 'expo-router';

export const Routes = {
  root: '/',
  auth: {
    login: '/(auth)/login' as Href,
    register: '/(auth)/register' as Href,
    forgotPassword: '/(auth)/forgot-password' as Href,
    resetPassword: '/auth/reset-password' as Href,
  },
  onboarding: {
    setup: '/(onboarding)/setup',
  },
  app: {
    home: '/(app)/(tabs)',
    chooseMode: '/(app)/choose-mode',
    discover: '/(app)/(tabs)/discover',
    jobs: '/(app)/(tabs)/jobs',
    createJob: '/(app)/jobs/create',
    jobDetail: (jobId: string): Href => ({
      pathname: '/(app)/jobs/[id]',
      params: { id: jobId },
    }),
    messages: '/(app)/(tabs)/messages',
    conversation: (conversationId: string): Href => ({
      pathname: '/(app)/messages/[conversationId]',
      params: { conversationId },
    }),
    profile: '/(app)/(tabs)/profile',
    editProfile: '/(app)/edit-profile',
    activateProfessional: '/(app)/activate-professional',
  },
} as const;
