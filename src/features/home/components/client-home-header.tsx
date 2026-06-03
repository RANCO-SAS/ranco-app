import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { AppText } from '@/components/ui/text';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { getDisplayName, getTimeGreeting } from '@/shared/utils/format-greeting';

type ClientHomeHeaderProps = {
  fullName?: string | null;
  avatarUrl?: string | null;
  userId?: string;
};

export function ClientHomeHeader({ fullName, avatarUrl, userId }: ClientHomeHeaderProps) {
  const router = useRouter();
  const timeGreeting = getTimeGreeting();
  const displayName = getDisplayName(fullName) || fullName?.trim() || '';

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <AppText color="textSecondary" variant="body">
          {timeGreeting}
        </AppText>
        {displayName ? (
          <AppText variant="title">{displayName}</AppText>
        ) : (
          <AppText variant="title">Usuario</AppText>
        )}
      </View>

      <View style={styles.actions}>
        <NotificationBell />
        {userId ? (
          <Pressable
            accessibilityLabel={`Ir a mi perfil, ${displayName || 'Usuario'}`}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push(Routes.app.profile)}>
            <Avatar imageUrl={avatarUrl} name={displayName || 'Usuario'} size={44} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
