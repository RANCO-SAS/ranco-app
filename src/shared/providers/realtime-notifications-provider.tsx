import type { ReactNode } from 'react';

import { useInboxMessagesRealtime } from '@/features/messages/hooks/use-inbox-messages-realtime';
import { useNotificationsRealtime } from '@/features/notifications/hooks/use-notifications-realtime';
import { usePushRegistration } from '@/features/notifications/hooks/use-push-registration';
import { usePublishedJobsRealtime } from '@/features/jobs/hooks/use-published-jobs-realtime';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';

type RealtimeNotificationsProviderProps = {
  children: ReactNode;
};

export function RealtimeNotificationsProvider({ children }: RealtimeNotificationsProviderProps) {
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const userId = profile?.id;

  usePushRegistration({ enabled: Boolean(userId), userId });

  useInboxMessagesRealtime({
    enabled: Boolean(userId),
    userId,
  });

  useNotificationsRealtime({
    enabled: Boolean(userId),
    userId,
  });

  usePublishedJobsRealtime({
    enabled: activeMode === 'professional' && Boolean(profile?.isProfessional),
  });

  return children;
}
