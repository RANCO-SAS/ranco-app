import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/avatar';
import { AppText } from '@/components/ui/text';
import { Layout, Spacing } from '@/constants/theme';
import { SERVICE_REQUEST_STATUS_LABELS } from '@/features/jobs/constants/service-request-labels';
import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';
import type { ConversationParticipant } from '@/features/messages/types/message.types';
import { useTheme } from '@/hooks/use-theme';

type ChatHeaderProps = {
  title: string;
  participant: ConversationParticipant;
  serviceRequestStatus: ServiceRequestStatus;
};

export function ChatHeader({
  title,
  participant,
  serviceRequestStatus,
}: ChatHeaderProps) {
  const router = useRouter();
  const theme = useTheme();

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
        <Avatar imageUrl={participant.avatarUrl} name={participant.fullName} size={40} />
        <View style={styles.meta}>
          <AppText numberOfLines={1} variant="bodyMedium">
            {participant.fullName}
          </AppText>
          <AppText color="primary" numberOfLines={1} variant="small">
            {title} · {SERVICE_REQUEST_STATUS_LABELS[serviceRequestStatus]}
          </AppText>
        </View>
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
