import { StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { ProfileAvatarLink } from '@/components/ui/profile-avatar-link';
import { StatusBadge } from '@/components/ui/status-badge';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { Conversation } from '@/features/messages/types/message.types';
import { formatConversationTime } from '@/shared/utils/format-relative-time';
import { useTheme } from '@/hooks/use-theme';

type ConversationListItemProps = {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
};

export function ConversationListItem({
  conversation,
  currentUserId,
  onPress,
}: ConversationListItemProps) {
  const theme = useTheme();
  const counterpart =
    currentUserId === conversation.clientId ? conversation.professional : conversation.client;
  const counterpartView =
    currentUserId === conversation.clientId ? 'professional' : 'client';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}>
      <View style={styles.topRow}>
        <ProfileAvatarLink
          imageUrl={counterpart.avatarUrl}
          name={counterpart.fullName}
          size={52}
          userId={counterpart.id}
          view={counterpartView}
        />

        <View style={styles.meta}>
          <View style={styles.titleRow}>
            <AppText numberOfLines={1} style={styles.name} variant="bodyMedium">
              {counterpart.fullName}
            </AppText>
            <AppText color="textMuted" variant="small">
              {formatConversationTime(conversation.updatedAt)}
            </AppText>
          </View>

          <AppText color="textSecondary" numberOfLines={1} variant="caption">
            {conversation.serviceRequestTitle}
          </AppText>
        </View>
      </View>

      <StatusBadge status={conversation.serviceRequestStatus} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  meta: {
    flex: 1,
    gap: Spacing.xs,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
  },
});
