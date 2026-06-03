import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StaggeredFadeIn, fadeInDownEntrance } from '@/components/ui/staggered-fade-in';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { UberSearchField } from '@/components/ui/uber-search-field';
import { ConversationListItem } from '@/features/messages/components/conversation-list-item';
import { useConversations } from '@/features/messages/hooks/use-conversations';
import type { Conversation } from '@/features/messages/types/message.types';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';

function filterConversations(conversations: Conversation[], query: string): Conversation[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return conversations;
  }

  return conversations.filter((conversation) => {
    const nameMatch =
      conversation.client.fullName.toLowerCase().includes(normalized) ||
      conversation.professional.fullName.toLowerCase().includes(normalized);
    const titleMatch = conversation.serviceRequestTitle.toLowerCase().includes(normalized);

    return nameMatch || titleMatch;
  });
}

export function MessagesListScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const conversationsQuery = useConversations(profile?.id);
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = useMemo(
    () => filterConversations(conversationsQuery.data ?? [], searchQuery),
    [conversationsQuery.data, searchQuery],
  );

  if (conversationsQuery.isLoading) {
    return <ScreenLayout loading loadingMessage="Cargando mensajes..." safeArea="tab" />;
  }

  if (conversationsQuery.error) {
    return (
      <ScreenLayout safeArea="tab">
        <StaggeredFadeIn index={0}>
          <AppText variant="title">Mensajes</AppText>
          <Spacer size="lg" />
          <Card>
            <AppText color="destructive" variant="body">
              No pudimos cargar tus conversaciones.
            </AppText>
          </Card>
        </StaggeredFadeIn>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      safeArea="tab"
      scrollable
      scrollViewProps={{
        refreshControl: (
          <RefreshControl
            onRefresh={() => {
              void conversationsQuery.refetch();
            }}
            refreshing={conversationsQuery.isRefetching}
          />
        ),
      }}>
      <Animated.View entering={fadeInDownEntrance()}>
        <AppText variant="title">Mensajes</AppText>
      </Animated.View>

      <Spacer size="lg" />

      <StaggeredFadeIn index={1}>
        <UberSearchField
          onChangeText={setSearchQuery}
          placeholder="Buscar mensajes..."
          showSearchIcon
          value={searchQuery}
        />
      </StaggeredFadeIn>

      <Spacer size="lg" />

      {conversations.length === 0 ? (
        <StaggeredFadeIn index={2}>
          <EmptyState
            title={searchQuery.trim() ? 'Sin resultados' : 'Sin conversaciones'}
          />
        </StaggeredFadeIn>
      ) : (
        <View style={styles.list}>
          {conversations.map((item, index) => (
            <StaggeredFadeIn index={index + 2} key={item.id}>
              <ConversationListItem
                conversation={item}
                currentUserId={profile?.id ?? ''}
                onPress={() => router.push(Routes.app.conversation(item.id))}
              />
            </StaggeredFadeIn>
          ))}
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
  },
});
