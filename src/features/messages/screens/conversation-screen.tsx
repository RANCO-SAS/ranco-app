import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout/stack-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useConversation,
  useMessages,
  useSendMessage,
} from '@/features/messages/hooks/use-conversations';
import type { Message } from '@/features/messages/types/message.types';
import { useTheme } from '@/hooks/use-theme';

type MessageBubbleProps = {
  message: Message;
  isOwn: boolean;
};

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const theme = useTheme();

  return (
    <View style={[styles.bubbleRow, isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isOwn ? theme.primary : theme.backgroundElement,
          },
        ]}>
        <AppText color={isOwn ? 'primaryForeground' : 'text'} variant="body">
          {message.content}
        </AppText>
      </View>
    </View>
  );
}

export function ConversationScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [draft, setDraft] = useState('');
  const conversationQuery = useConversation(conversationId);
  const messagesQuery = useMessages(conversationId);
  const sendMessage = useSendMessage();

  const messages = messagesQuery.data ?? [];
  const title = conversationQuery.data?.serviceRequestTitle ?? 'Conversación';

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  const handleSend = () => {
    if (!session?.userId || !conversationId || !canSend) {
      return;
    }

    sendMessage.mutate(
      {
        conversationId,
        senderId: session.userId,
        content: draft,
      },
      {
        onSuccess: () => {
          setDraft('');
        },
      },
    );
  };

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Loader message="Cargando conversación..." />
      </SafeAreaView>
    );
  }

  if (conversationQuery.error || !conversationQuery.data) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StackHeader title="Chat" />
        <View style={styles.emptyContainer}>
          <EmptyState
            description="No encontramos esta conversación o no tienes acceso."
            title="Chat no disponible"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StackHeader title={title} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.flex}>
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              description="Envía el primer mensaje para iniciar la negociación."
              title="Sin mensajes aún"
            />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.messagesList}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble isOwn={item.senderId === session?.userId} message={item} />
            )}
          />
        )}

        <View style={[styles.composer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          <Input
            editable={!sendMessage.isPending}
            onChangeText={setDraft}
            placeholder="Escribe un mensaje..."
            value={draft}
          />
          <Button
            disabled={!canSend || sendMessage.isPending}
            label={sendMessage.isPending ? 'Enviando...' : 'Enviar'}
            onPress={handleSend}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingHorizontal,
  },
  messagesList: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowOwn: {
    justifyContent: 'flex-end',
  },
  bubbleRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  composer: {
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingVertical: Spacing.md,
  },
});
