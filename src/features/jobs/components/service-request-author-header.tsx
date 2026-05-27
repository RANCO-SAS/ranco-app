import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProfileAvatarLink } from '@/components/ui/profile-avatar-link';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import type { ServiceRequestClientPreview } from '@/features/jobs/types/service-request.types';

type ServiceRequestAuthorHeaderProps = {
  client: ServiceRequestClientPreview;
  createdAt: string;
  subtitle?: string;
};

function formatPostedAt(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `hace ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `hace ${diffDays} d`;
  }

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

export function ServiceRequestAuthorHeader({
  client,
  createdAt,
  subtitle,
}: ServiceRequestAuthorHeaderProps) {
  const router = useRouter();
  const displayName = client.fullName.trim() || 'Cliente';

  return (
    <View style={styles.container}>
      <ProfileAvatarLink
        imageUrl={client.avatarUrl}
        name={displayName}
        size={44}
        userId={client.id}
        view="client"
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(Routes.app.userProfile(client.id, 'client'))}
        style={styles.meta}>
        <AppText variant="bodyMedium">{displayName}</AppText>
        <AppText color="textMuted" numberOfLines={1} variant="small">
          {formatPostedAt(createdAt)}
          {subtitle ? ` · ${subtitle}` : ''}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
});
