import type { Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { useUnreadNotificationCount } from '@/features/notifications/hooks/use-notifications';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';

export function NotificationBell() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const unreadQuery = useUnreadNotificationCount(profile?.id);
  const unreadCount = unreadQuery.data ?? 0;

  return (
    <Pressable
      accessibilityLabel="Notificaciones"
      accessibilityRole="button"
      onPress={() => router.push(Routes.app.notifications as Href)}
      style={styles.button}>
      <AppText style={styles.icon}>🔔</AppText>
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <AppText style={styles.badgeText} variant="small">
            {unreadCount > 9 ? '9+' : String(unreadCount)}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#E5484D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
