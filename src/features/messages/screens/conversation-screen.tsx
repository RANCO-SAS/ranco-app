import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatHeader } from '@/components/layout/chat-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { JobEngagementPanel } from '@/features/jobs/components/job-engagement-panel';
import { useServiceRequest } from '@/features/jobs/hooks/use-service-requests';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useConversation,
  useMessages,
  useSendImageMessage,
  useSendTextMessage,
} from '@/features/messages/hooks/use-conversations';
import type { Conversation, Message } from '@/features/messages/types/message.types';
import { ReviewForm } from '@/features/reviews/components/review-form';
import { useJobReview } from '@/features/reviews/hooks/use-reviews';
import { useKeyboardLayout } from '@/hooks/use-keyboard-layout';
import { useTheme } from '@/hooks/use-theme';

type MessageBubbleProps = {
  message: Message;
  isOwn: boolean;
};

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const theme = useTheme();

  if (message.type === 'image' && message.mediaUrl) {
    return (
      <View style={[styles.bubbleRow, isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther]}>
        <Image
          contentFit="cover"
          source={{ uri: message.mediaUrl }}
          style={[styles.imageBubble, { backgroundColor: theme.backgroundElement }]}
        />
      </View>
    );
  }

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

function resolveCounterpart(conversation: Conversation, userId: string | undefined) {
  if (userId === conversation.clientId) {
    return conversation.professional;
  }

  return conversation.client;
}

export function ConversationScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [draft, setDraft] = useState('');
  const conversationQuery = useConversation(conversationId);
  const messagesQuery = useMessages(conversationId);
  const sendTextMessage = useSendTextMessage();
  const sendImageMessage = useSendImageMessage();
  const { insets, keyboardBehavior, keyboardVerticalOffset } = useKeyboardLayout();

  const conversation = conversationQuery.data;
  const requestQuery = useServiceRequest(conversation?.serviceRequestId);
  const request = requestQuery.data;

  const counterpart = conversation ? resolveCounterpart(conversation, session?.userId) : null;
  const isClient = session?.userId === conversation?.clientId;

  const revieweeId = isClient ? conversation?.professionalId : conversation?.clientId;
  const revieweeName = counterpart?.fullName ?? 'Usuario';
  const jobReviewQuery = useJobReview(
    conversation?.serviceRequestId,
    request?.status === 'completed' ? session?.userId : undefined,
  );

  const messages = messagesQuery.data ?? [];
  const canSend = useMemo(() => draft.trim().length > 0, [draft]);
  const isPending = sendTextMessage.isPending || sendImageMessage.isPending;

  const handleSend = () => {
    if (!session?.userId || !conversationId || !canSend) {
      return;
    }

    sendTextMessage.mutate(
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

  const handlePickImage = async () => {
    if (!session?.userId || !conversationId || isPending) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    sendImageMessage.mutate({
      conversationId,
      senderId: session.userId,
      mediaUri: result.assets[0].uri,
    });
  };

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Loader message="Cargando conversación..." />
      </SafeAreaView>
    );
  }

  if (conversationQuery.error || !conversation || !counterpart) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ChatHeader
          participant={{ id: '', fullName: 'Chat', avatarUrl: null }}
          serviceRequestStatus="published"
          subtitle="Conversación"
          title="Chat"
        />
        <View style={styles.emptyContainer}>
          <EmptyState
            description="No encontramos esta conversación o no tienes acceso."
            title="Chat no disponible"
          />
        </View>
      </SafeAreaView>
    );
  }

  const serviceRequestStatus = request?.status ?? conversation.serviceRequestStatus;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ChatHeader
        participant={counterpart}
        serviceRequestStatus={serviceRequestStatus}
        subtitle={isClient ? 'Profesional' : 'Cliente'}
        title={conversation.serviceRequestTitle}
      />

      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.flex}>
        <FlatList
          ListHeaderComponent={
            <View style={styles.headerContent}>
              {request && session?.userId ? (
                <JobEngagementPanel
                  assignedProfessionalId={request.assignedProfessionalId}
                  clientId={request.clientId}
                  isClient={isClient}
                  professionalId={conversation.professionalId}
                  requestId={request.id}
                  status={request.status}
                  userId={session.userId}
                />
              ) : null}

              {request?.status === 'completed' && revieweeId && session?.userId ? (
                <>
                  <Spacer size="md" />
                  <ReviewForm
                    existingRating={jobReviewQuery.data?.rating}
                    revieweeId={revieweeId}
                    revieweeName={revieweeName}
                    reviewerId={session.userId}
                    serviceRequestId={request.id}
                  />
                </>
              ) : null}

              {messages.length === 0 ? (
                <>
                  <Spacer size="md" />
                  <EmptyState
                    description="Envía el primer mensaje o comparte una foto."
                    title="Sin mensajes aún"
                  />
                </>
              ) : null}
            </View>
          }
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.messagesList}
          data={messages}
          keyExtractor={(item) => item.id}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <MessageBubble isOwn={item.senderId === session?.userId} message={item} />
          )}
        />

        <View
          style={[
            styles.composer,
            {
              borderTopColor: theme.border,
              backgroundColor: theme.background,
              paddingBottom: Math.max(insets.bottom, Spacing.md),
            },
          ]}>
          <View style={styles.composerRow}>
            <Pressable
              accessibilityRole="button"
              disabled={isPending}
              onPress={() => {
                void handlePickImage();
              }}
              style={styles.attachButton}>
              <AppText color="primary" variant="bodyMedium">
                📷
              </AppText>
            </Pressable>
            <View style={styles.inputWrapper}>
              <Input
                editable={!isPending}
                onChangeText={setDraft}
                placeholder="Escribe un mensaje..."
                value={draft}
              />
            </View>
          </View>
          <Button
            disabled={!canSend || isPending}
            label={isPending ? 'Enviando...' : 'Enviar'}
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
  headerContent: {
    paddingBottom: Spacing.md,
  },
  messagesList: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    flexGrow: 1,
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
  imageBubble: {
    width: 220,
    height: 220,
    borderRadius: Radius.md,
  },
  composer: {
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.md,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  attachButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
  },
});
