import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { StackHeader } from '@/components/layout/stack-header';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { StaggeredFadeIn, fadeInDownEntrance } from '@/components/ui/staggered-fade-in';
import { AppText } from '@/components/ui/text';
import { NotificationListItem } from '@/features/notifications/components/notification-list-item';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/hooks/use-notifications';
import type { AppNotification } from '@/features/notifications/types/notification.types';
import { groupNotificationsByTime } from '@/features/notifications/utils/group-notifications';
import { resolveNotificationRoute } from '@/features/notifications/utils/notification-route';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { Layout, Spacing } from '@/constants/theme';

export function NotificationsScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const notificationsQuery = useNotifications(profile?.id);
  const markRead = useMarkNotificationRead(profile?.id);
  const markAllRead = useMarkAllNotificationsRead(profile?.id);

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item) => !item.readAt).length;
  const groupedNotifications = useMemo(
    () => groupNotificationsByTime(notifications),
    [notifications],
  );

  const handlePress = (notification: AppNotification) => {
    if (!notification.readAt) {
      markRead.mutate(notification.id);
    }

    const route = resolveNotificationRoute(notification);

    if (route) {
      router.push(route);
    }
  };

  return (
    <ScreenLayout flush scrollable={false}>
      <View style={styles.header}>
        <StackHeader applyTopInset title="Notificaciones" />
        {unreadCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            disabled={markAllRead.isPending}
            onPress={() => markAllRead.mutate()}
            style={styles.markAllButton}>
            <AppText color="primary" variant="caption">
              Marcar todas como leídas
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}>
        {notificationsQuery.isLoading ? (
          <StaggeredFadeIn index={0}>
            <AppText color="textSecondary">Cargando...</AppText>
          </StaggeredFadeIn>
        ) : notifications.length === 0 ? (
          <StaggeredFadeIn index={0}>
            <EmptyState title="Sin notificaciones" />
          </StaggeredFadeIn>
        ) : (
          <View style={styles.list}>
            {groupedNotifications.map((group, groupIndex) => (
              <View key={group.key} style={styles.group}>
                <Animated.View entering={fadeInDownEntrance(groupIndex)}>
                  <AppText color="textMuted" style={styles.groupLabel} variant="small">
                    {group.label.toUpperCase()}
                  </AppText>
                </Animated.View>

                <View style={styles.groupItems}>
                  {group.items.map((item, itemIndex) => (
                    <StaggeredFadeIn index={groupIndex * 3 + itemIndex + 1} key={item.id}>
                      <NotificationListItem
                        notification={item}
                        onPress={() => handlePress(item)}
                      />
                    </StaggeredFadeIn>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.xs,
  },
  markAllButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: Spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  list: {
    gap: Spacing.xl,
  },
  group: {
    gap: Spacing.md,
  },
  groupLabel: {
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  groupItems: {
    gap: Spacing.md,
  },
});
