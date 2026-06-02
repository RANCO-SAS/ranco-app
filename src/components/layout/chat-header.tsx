import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppIcon } from '@/components/ui/app-icon';
import { ProfileAvatarLink } from '@/components/ui/profile-avatar-link';
import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';
import type { ConversationParticipant } from '@/features/messages/types/message.types';
import { useTheme } from '@/hooks/use-theme';

type ChatHeaderProps = {
  title: string;
  participant: ConversationParticipant;
  serviceRequestStatus: ServiceRequestStatus;
  participantView?: 'client' | 'professional';
  serviceRequestId?: string;
};

export function ChatHeader({
  title,
  participant,
  serviceRequestStatus,
  participantView,
  serviceRequestId,
}: ChatHeaderProps) {
  const router = useRouter();
  const theme = useTheme();

  const handleOpenProfile = () => {
    if (!participant.id) {
      return;
    }

    router.push(Routes.app.userProfile(participant.id, participantView));
  };

  const handleOpenDetails = () => {
    if (!serviceRequestId) {
      return;
    }

    router.push(Routes.app.jobDetail(serviceRequestId));
  };

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: theme.border, backgroundColor: theme.backgroundSecondary },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        hitSlop={Spacing.sm}
        onPress={() => router.back()}
        style={styles.sideButton}>
        <AppIcon color={theme.text} name="chevron-back" size={24} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={!participant.id}
        onPress={handleOpenProfile}
        style={styles.center}>
        <ProfileAvatarLink
          imageUrl={participant.avatarUrl}
          name={participant.fullName}
          size={36}
          userId={participant.id}
          view={participantView}
        />
        <View style={styles.meta}>
          <AppText numberOfLines={1} variant="bodyMedium">
            {participant.fullName}
          </AppText>
          <AppText color="textSecondary" numberOfLines={1} variant="small">
            {title}
          </AppText>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={!serviceRequestId}
        onPress={handleOpenDetails}
        style={[styles.detailsButton, { backgroundColor: theme.backgroundElement }]}>
        <AppIcon color={theme.textMuted} name="information-circle-outline" size={16} />
        <AppText color="textSecondary" variant="small">
          Detalles
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: Layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPaddingHorizontal,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  sideButton: {
    width: 36,
    height: Layout.minTouchTarget,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 0,
  },
  meta: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
});
