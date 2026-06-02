import * as ImagePicker from 'expo-image-picker';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatHeader } from '@/components/layout/chat-header';
import { AppIcon } from '@/components/ui/app-icon';
import { MessageStatusIndicator } from '@/features/messages/components/message-status-indicator';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { ZoomableImage } from '@/components/ui/zoomable-image';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { ChatJobStatusBanner } from '@/features/jobs/components/chat-job-status-banner';
import { JobEngagementPanel } from '@/features/jobs/components/job-engagement-panel';
import { useServiceRequest } from '@/features/jobs/hooks/use-service-requests';
import { getJobEngagementStatusMessage } from '@/features/jobs/utils/job-engagement-status';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useConversation,
  useMessages,
  useSendImageMessage,
  useSendTextMessage,
} from '@/features/messages/hooks/use-conversations';
import {
  useMessageReceipts,
  useMessagesRealtime,
} from '@/features/messages/hooks/use-messages-realtime';
import { useTypingIndicator } from '@/features/messages/hooks/use-typing-indicator';
import { useServiceRequestRealtime } from '@/features/jobs/hooks/use-service-request-realtime';
import type { Conversation, Message } from '@/features/messages/types/message.types';
import {
  formatMessageTime,
  getMessageDeliveryStatus,
} from '@/features/messages/utils/message-status';
import { ReviewForm } from '@/features/reviews/components/review-form';
import { useJobReview } from '@/features/reviews/hooks/use-reviews';
import { useKeyboardLayout } from '@/hooks/use-keyboard-layout';
import { useTheme } from '@/hooks/use-theme';
import { devError, devLog } from '@/lib/dev-logger';

type MessageBubbleProps = {
  message: Message;
  isOwn: boolean;
};

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const theme = useTheme();
  const deliveryStatus = getMessageDeliveryStatus(message);
  const timeLabel = formatMessageTime(message.createdAt);

  if (message.type === 'image' && message.mediaUrl) {
    return (
      <View style={[styles.bubbleRow, isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther]}>
        <View style={styles.imageBubbleWrapper}>
          <ZoomableImage
            contentFit="cover"
            style={[styles.imageBubble, { backgroundColor: theme.backgroundElement }]}
            uri={message.mediaUrl}
          />
          <View style={[styles.metaRow, styles.imageMetaRow]}>
            <AppText color="textMuted" variant="small">
              {timeLabel}
            </AppText>
            <MessageStatusIndicator isOwn={isOwn} status={deliveryStatus} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleRow, isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther]}>
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
          {
            backgroundColor: isOwn ? theme.primary : theme.backgroundSecondary,
          },
        ]}>
        <AppText color={isOwn ? 'primaryForeground' : 'text'} variant="body">
          {message.content}
        </AppText>
        <View style={styles.metaRow}>
          <AppText
            color={isOwn ? 'primaryForeground' : 'textMuted'}
            style={isOwn ? styles.metaOnPrimary : undefined}
            variant="small">
            {timeLabel}
          </AppText>
          <MessageStatusIndicator isOwn={isOwn} status={deliveryStatus} />
        </View>
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

  const revieweeId = isClient
    ? (request?.assignedProfessionalId ?? conversation?.professionalId)
    : (request?.clientId ?? conversation?.clientId);
  const revieweeName = counterpart?.fullName ?? 'Usuario';
  const jobReviewQuery = useJobReview(
    conversation?.serviceRequestId,
    request?.status === 'completed' ? session?.userId : undefined,
  );
  const isReviewInitialLoading = jobReviewQuery.isLoading && jobReviewQuery.data === undefined;

  const messages = messagesQuery.data ?? [];
  const canSend = useMemo(() => draft.trim().length > 0, [draft]);
  const isPending = sendTextMessage.isPending || sendImageMessage.isPending;

  useMessagesRealtime({
    conversationId,
    enabled: Boolean(conversation),
    userId: session?.userId,
  });

  useServiceRequestRealtime({
    requestId: conversation?.serviceRequestId,
    clientId: conversation?.clientId,
    assignedProfessionalId: request?.assignedProfessionalId ?? undefined,
    enabled: Boolean(conversation && request),
  });

  const { typingLabel } = useTypingIndicator({
    conversationId,
    draft,
    enabled: Boolean(conversation && session?.userId),
    userId: session?.userId,
    userName: session?.email?.split('@')[0] ?? 'Usuario',
  });

  useMessageReceipts({
    conversationId,
    enabled: Boolean(conversation),
    messages,
    userId: session?.userId,
  });

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
    devLog('storage', 'chat-image:permission', {
      granted: permission.granted,
      status: permission.status,
      canAskAgain: permission.canAskAgain,
    });

    if (!permission.granted) {
      devLog('storage', 'chat-image:permission-denied');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) {
      devLog('storage', 'chat-image:cancelled');
      return;
    }

    const asset = result.assets[0];
    devLog('storage', 'chat-image:selected', {
      uriScheme: asset.uri.split(':')[0],
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType ?? null,
      fileSize: asset.fileSize ?? null,
    });

    sendImageMessage.mutate(
      {
        conversationId,
        senderId: session.userId,
        mediaUri: asset.uri,
      },
      {
        onError: (error) => {
          devError('storage', 'chat-image:send-failed', error, { conversationId });
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

  if (conversationQuery.error || !conversation || !counterpart) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ChatHeader
          participant={{ id: '', fullName: 'Chat', avatarUrl: null }}
          serviceRequestStatus="published"
          title="Chat"
        />
        <View style={styles.emptyContainer}>
          <EmptyState title="Chat no disponible" />
        </View>
      </SafeAreaView>
    );
  }

  const serviceRequestStatus = request?.status ?? conversation.serviceRequestStatus;
  const engagementMessage =
    request && session?.userId
      ? getJobEngagementStatusMessage({
          requestId: request.id,
          userId: session.userId,
          clientId: request.clientId,
          professionalId: conversation.professionalId,
          professionalName: counterpart.fullName,
          status: request.status,
          assignedProfessionalId: request.assignedProfessionalId,
          isClient,
        })
      : null;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ChatHeader
        participant={counterpart}
        participantView={isClient ? 'professional' : 'client'}
        serviceRequestId={conversation.serviceRequestId}
        serviceRequestStatus={serviceRequestStatus}
        title={conversation.serviceRequestTitle}
      />

      <ChatJobStatusBanner message={engagementMessage} status={serviceRequestStatus} />

      {request && session?.userId ? (
        <JobEngagementPanel
          assignedProfessionalId={request.assignedProfessionalId}
          clientId={request.clientId}
          isClient={isClient}
          professionalId={conversation.professionalId}
          professionalName={counterpart.fullName}
          requestId={request.id}
          status={request.status}
          userId={session.userId}
          variant="actions"
        />
      ) : null}

      {typingLabel ? (
        <View style={styles.typingRow}>
          <AppText color="textMuted" variant="small">
            {typingLabel}
          </AppText>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.flex}>
        <FlatList
          ListHeaderComponent={
            <View style={styles.headerContent}>
              {request?.status === 'completed' && revieweeId && session?.userId ? (
                <>
                  {isReviewInitialLoading ? (
                    <Card>
                      <Loader message="Cargando reseña..." size="small" variant="inline" />
                    </Card>
                  ) : (
                    <ReviewForm
                      existingReview={jobReviewQuery.data}
                      revieweeId={revieweeId}
                      revieweeIsProfessional={isClient}
                      revieweeName={revieweeName}
                      reviewerId={session.userId}
                      serviceRequestId={request.id}
                    />
                  )}
                  <Spacer size="md" />
                </>
              ) : null}

              {messages.length === 0 ? <EmptyState title="Sin mensajes" /> : null}
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
          <View style={[styles.inputShell, { backgroundColor: theme.backgroundSecondary }]}>
            <TextInput
              editable={!isPending}
              onChangeText={setDraft}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={theme.textMuted}
              style={[styles.composerInput, { color: theme.text }]}
              value={draft}
            />
            <Pressable
              accessibilityRole="button"
              disabled={isPending}
              onPress={() => {
                void handlePickImage();
              }}
              style={styles.iconButton}>
              <AppIcon color={theme.textMuted} name="camera-outline" size={22} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canSend || isPending}
            onPress={handleSend}
            style={[
              styles.sendButton,
              {
                backgroundColor: canSend && !isPending ? theme.primary : theme.backgroundElement,
              },
            ]}>
            <AppText
              color={canSend && !isPending ? 'primaryForeground' : 'textMuted'}
              variant="bodyMedium">
              {isPending ? '...' : 'Enviar'}
            </AppText>
          </Pressable>
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
  typingRow: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: Spacing.xs,
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
    maxWidth: '82%',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  bubbleOwn: {
    borderBottomRightRadius: Radius.sm,
  },
  bubbleOther: {
    borderBottomLeftRadius: Radius.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  metaOnPrimary: {
    opacity: 0.85,
  },
  imageBubbleWrapper: {
    maxWidth: '82%',
    gap: Spacing.xs,
  },
  imageMetaRow: {
    justifyContent: 'flex-end',
  },
  imageBubble: {
    width: 220,
    height: 220,
    borderRadius: Radius.lg,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.md,
  },
  inputShell: {
    flex: 1,
    minHeight: Layout.minTouchTarget,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
  },
  composerInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    minHeight: Layout.minTouchTarget,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
