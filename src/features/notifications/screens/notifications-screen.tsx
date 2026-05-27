import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/hooks/use-notifications';
import { useNotificationsRealtime } from '@/features/notifications/hooks/use-notifications-realtime';
import type { AppNotification } from '@/features/notifications/types/notification.types';
import { resolveNotificationRoute } from '@/features/notifications/utils/notification-route';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type NotificationItemProps = {
  notification: AppNotification;
  onPress: () => void;
};

function NotificationItem({ notification, onPress }: NotificationItemProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Card>
        <View style={styles.itemHeader}>
          <AppText variant="bodyMedium">{notification.title}</AppText>
          {!notification.readAt ? <View style={styles.unreadDot} /> : null}
        </View>
        <AppText color="textSecondary" variant="body">
          {notification.body}
        </AppText>
        <AppText color="textMuted" variant="small">
          {formatCreatedAt(notification.createdAt)}
        </AppText>
      </Card>
    </Pressable>
  );
}

export function NotificationsScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const notificationsQuery = useNotifications(profile?.id);
  const markRead = useMarkNotificationRead(profile?.id);
  const markAllRead = useMarkAllNotificationsRead(profile?.id);

  useNotificationsRealtime({
    enabled: Boolean(profile?.id),
    userId: profile?.id,
  });

  const handlePress = (notification: AppNotification) => {
    if (!notification.readAt) {
      markRead.mutate(notification.id);
    }

    const route = resolveNotificationRoute(notification);

    if (route) {
      router.push(route);
    }
  };

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  return (
    <ScreenLayout scrollable>
      <Section title="Notificaciones">
        {unreadCount > 0 ? (
          <>
            <Button
              label="Marcar todas como leídas"
              onPress={() => markAllRead.mutate()}
              variant="secondary"
            />
          </>
        ) : null}

        {notificationsQuery.isLoading ? (
          <AppText color="textSecondary">Cargando...</AppText>
        ) : notifications.length === 0 ? (
          <EmptyState title="Sin notificaciones" />
        ) : (
          <View style={styles.list}>
            {notifications.map((item) => (
              <NotificationItem
                key={item.id}
                notification={item}
                onPress={() => handlePress(item)}
              />
            ))}
          </View>
        )}
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#208AEF',
  },
});
