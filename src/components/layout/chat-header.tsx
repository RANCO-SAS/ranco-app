import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ProfileAvatarLink } from '@/components/ui/profile-avatar-link';
import { AppText } from '@/components/ui/text';
import { Layout, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { SERVICE_REQUEST_STATUS_LABELS } from '@/features/jobs/constants/service-request-labels';
import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';
import type { ConversationParticipant } from '@/features/messages/types/message.types';
import { useTheme } from '@/hooks/use-theme';

type ChatHeaderProps = {
  title: string;
  participant: ConversationParticipant;
  serviceRequestStatus: ServiceRequestStatus;
  participantView?: 'client' | 'professional';
};

export function ChatHeader({
  title,
  participant,
  serviceRequestStatus,
  participantView,
}: ChatHeaderProps) {
  const router = useRouter();
  const theme = useTheme();

  const handleOpenProfile = () => {
    if (!participant.id) {
      return;
    }

    router.push(Routes.app.userProfile(participant.id, participantView));
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.border, backgroundColor: theme.background }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        hitSlop={Spacing.sm}
        onPress={() => router.back()}
        style={styles.backButton}>
        <AppText color="primary" variant="bodyMedium">
          Volver
        </AppText>
      </Pressable>

      <View style={styles.center}>
        <ProfileAvatarLink
          imageUrl={participant.avatarUrl}
          name={participant.fullName}
          size={40}
          userId={participant.id}
          view={participantView}
        />
        <Pressable
          accessibilityRole="button"
          disabled={!participant.id}
          onPress={handleOpenProfile}
          style={styles.meta}>
          <AppText numberOfLines={1} variant="bodyMedium">
            {participant.fullName}
          </AppText>
          <AppText color="primary" numberOfLines={1} variant="small">
            {title} · {SERVICE_REQUEST_STATUS_LABELS[serviceRequestStatus]}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.backButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: Layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPaddingHorizontal,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    minWidth: 64,
    minHeight: Layout.minTouchTarget,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
});
