import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/avatar';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { SERVICE_REQUEST_STATUS_LABELS } from '@/features/jobs/constants/service-request-labels';
import { useConversations } from '@/features/messages/hooks/use-conversations';
import type { Conversation } from '@/features/messages/types/message.types';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type ConversationListItemProps = {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
};

function ConversationListItem({ conversation, currentUserId, onPress }: ConversationListItemProps) {
  const counterpart =
    currentUserId === conversation.clientId ? conversation.professional : conversation.client;

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Card>
        <View style={styles.row}>
          <Avatar
            imageUrl={counterpart.avatarUrl}
            name={counterpart.fullName}
            size={48}
          />
          <View style={styles.meta}>
            <AppText variant="bodyMedium">{counterpart.fullName}</AppText>
            <AppText color="textSecondary" numberOfLines={1} variant="caption">
              {conversation.serviceRequestTitle}
            </AppText>
            <AppText color="primary" variant="small">
              {SERVICE_REQUEST_STATUS_LABELS[conversation.serviceRequestStatus]}
            </AppText>
          </View>
        </View>
        <AppText variant="caption" color="textMuted">
          Actualizado {formatUpdatedAt(conversation.updatedAt)}
        </AppText>
      </Card>
    </Pressable>
  );
}

export function MessagesListScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const conversationsQuery = useConversations(profile?.id);

  if (conversationsQuery.isLoading) {
    return <ScreenLayout loading loadingMessage="Cargando mensajes..." safeArea="tab" />;
  }

  if (conversationsQuery.error) {
    return (
      <ScreenLayout safeArea="tab">
        <Section title="Mensajes" description="Conversaciones con clientes y profesionales.">
          <Card>
            <AppText variant="body" color="destructive">
              No pudimos cargar tus conversaciones.
            </AppText>
          </Card>
        </Section>
      </ScreenLayout>
    );
  }

  const conversations = conversationsQuery.data ?? [];

  return (
    <ScreenLayout safeArea="tab" scrollable>
      <Section title="Mensajes" description="Conversaciones con clientes y profesionales.">
        {conversations.length === 0 ? (
          <EmptyState
            description="Cuando contactes a alguien desde Explorar, el chat aparecerá aquí."
            title="Bandeja vacía"
          />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConversationListItem
                conversation={item}
                currentUserId={profile?.id ?? ''}
                onPress={() => router.push(Routes.app.conversation(item.id))}
              />
            )}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
          />
        )}
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
});
