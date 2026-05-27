import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationService } from '@/features/notifications/services/notification.service';
import { queryKeys } from '@/lib/query-keys';

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.notifications.list(userId ?? 'unknown'),
    queryFn: () => notificationService.getNotifications(userId!),
    enabled: Boolean(userId),
  });
}

export function useUnreadNotificationCount(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(userId ?? 'unknown'),
    queryFn: () => notificationService.getUnreadCount(userId!),
    enabled: Boolean(userId),
    staleTime: 15_000,
  });
}

export function useMarkNotificationRead(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      if (!userId) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(userId),
      });
    },
  });
}

export function useMarkAllNotificationsRead(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(userId!),
    onSuccess: () => {
      if (!userId) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(userId),
      });
    },
  });
}
