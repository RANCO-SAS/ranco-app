import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppIcon } from '@/components/ui/app-icon';
import { ProfileAvatarLink } from '@/components/ui/profile-avatar-link';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import type { ServiceRequestClientPreview } from '@/features/jobs/types/service-request.types';
import { formatPostedAt } from '@/shared/utils/format-posted-at';
import { useTheme } from '@/hooks/use-theme';

type OpportunityClientRowProps = {
  client: ServiceRequestClientPreview;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
};

export function OpportunityClientRow({
  client,
  createdAt,
  rating,
  reviewCount,
}: OpportunityClientRowProps) {
  const router = useRouter();
  const theme = useTheme();
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

        <View style={styles.metaRow}>
          {rating !== undefined && rating > 0 ? (
            <View style={styles.ratingRow}>
              <AppIcon color={theme.warning} name="star" size={14} />
              <AppText color="textSecondary" variant="small">
                {rating.toFixed(1)}
                {reviewCount ? ` (${reviewCount})` : ''}
              </AppText>
            </View>
          ) : null}
          <AppText color="textMuted" variant="small">
            {formatPostedAt(createdAt)}
          </AppText>
        </View>
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
    gap: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
