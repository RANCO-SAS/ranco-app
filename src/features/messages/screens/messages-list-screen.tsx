import { FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
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
  onPress: () => void;
};

function ConversationListItem({ conversation, onPress }: ConversationListItemProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Card>
        <AppText variant="bodyMedium">{conversation.serviceRequestTitle}</AppText>
        <AppText variant="caption" color="textSecondary">
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
    return <ScreenLayout loading loadingMessage="Cargando mensajes..." />;
  }

  if (conversationsQuery.error) {
    return (
      <ScreenLayout>
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
    <ScreenLayout scrollable>
      <Section
        title="Mensajes"
        description="Conversaciones con clientes y profesionales.">
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
});
