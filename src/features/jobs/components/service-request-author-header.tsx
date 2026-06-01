import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProfileAvatarLink } from '@/components/ui/profile-avatar-link';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import type { ServiceRequestClientPreview } from '@/features/jobs/types/service-request.types';
import { formatPostedAt } from '@/shared/utils/format-posted-at';

type ServiceRequestAuthorHeaderProps = {
  client: ServiceRequestClientPreview;
  createdAt: string;
  categoryLabel?: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function ServiceRequestAuthorHeader({
  client,
  createdAt,
  categoryLabel,
  subtitle,
  trailing,
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
        {categoryLabel ? (
          <AppText numberOfLines={1} variant="small">
            <AppText color="primary">{categoryLabel}</AppText>
            <AppText color="textMuted"> · </AppText>
            <AppText color="textMuted">{formatPostedAt(createdAt)}</AppText>
          </AppText>
        ) : (
          <AppText color="textMuted" numberOfLines={1} variant="small">
            {subtitle ?? formatPostedAt(createdAt)}
          </AppText>
        )}
      </Pressable>

      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
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
    minWidth: 0,
  },
  trailing: {
    alignSelf: 'flex-start',
  },
});
