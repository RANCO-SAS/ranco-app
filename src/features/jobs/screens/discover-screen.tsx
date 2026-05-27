import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { AppText } from '@/components/ui/text';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { JobOpportunityCard } from '@/features/jobs/components/discover/job-opportunity-card';
import { usePublishedServiceRequests } from '@/features/jobs/hooks/use-service-requests';
import { usePublishedJobsRealtime } from '@/features/jobs/hooks/use-published-jobs-realtime';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';
import { useStartConversation } from '@/features/messages/hooks/use-conversations';
import { ActiveModeBanner } from '@/features/profile/components/active-mode-banner';
import { ModeGateEmptyState } from '@/features/profile/components/mode-gate-empty-state';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';

export function DiscoverScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const isProfessionalMode = activeMode === 'professional';
  const startConversation = useStartConversation();

  const publishedRequests = usePublishedServiceRequests(
    Boolean(profile?.isProfessional && isProfessionalMode),
  );

  usePublishedJobsRealtime({
    enabled: Boolean(profile?.isProfessional && isProfessionalMode),
  });

  const professionalAreas = profile?.professionalSubcategoryIds ?? [];

  const opportunities = useMemo(() => {
    if (!profile) {
      return [];
    }

    return (publishedRequests.data ?? [])
      .filter(
        (request) =>
          request.clientId !== profile.id &&
          professionalAreas.includes(request.subcategoryId),
      )
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
  }, [profile, professionalAreas, publishedRequests.data]);

  const handleContact = (serviceRequestId: string, clientId: string) => {
    if (!profile) {
      return;
    }

    startConversation.mutate(
      {
        serviceRequestId,
        clientId,
        professionalId: profile.id,
      },
      {
        onSuccess: (conversation) => {
          router.push(Routes.app.conversation(conversation.id));
        },
      },
    );
  };

  const renderOpportunity: ListRenderItem<ServiceRequest> = ({ item }) => (
    <JobOpportunityCard
      isContactLoading={startConversation.isPending}
      onContactPress={() => handleContact(item.id, item.clientId)}
      onDetailsPress={() => router.push(Routes.app.jobDetail(item.id))}
      request={item}
    />
  );

  if (publishedRequests.isLoading) {
    return (
      <ScreenLayout loading loadingMessage="Buscando oportunidades..." safeArea="tab" />
    );
  }

  if (publishedRequests.error) {
    return (
      <ScreenLayout safeArea="tab">
        <Section title="Oportunidades">
          <Card>
            <AppText color="destructive" variant="body">
              No pudimos cargar oportunidades. Inténtalo de nuevo.
            </AppText>
          </Card>
        </Section>
      </ScreenLayout>
    );
  }

  if (!profile?.isProfessional) {
    return (
      <ScreenLayout safeArea="tab">
        <Section title="Oportunidades">
          <EmptyState
            description="Activa el rol de profesional en tu perfil para ver oportunidades."
            title="Rol profesional no activo"
          />
        </Section>
      </ScreenLayout>
    );
  }

  if (!isProfessionalMode) {
    return (
      <ScreenLayout safeArea="tab">
        <ModeGateEmptyState requiredMode="professional" />
      </ScreenLayout>
    );
  }

  if (professionalAreas.length === 0) {
    return (
      <ScreenLayout safeArea="tab">
        <Section title="Oportunidades">
          <EmptyState
            description="Configura qué servicios ofreces para recibir solicitudes relevantes."
            title="Define tu oficio"
          />
          <Spacer size="md" />
          <Button
            label="Configurar áreas de servicio"
            onPress={() => router.push(Routes.app.activateProfessional)}
            variant="dark"
          />
        </Section>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout safeArea="tab">
      <Section
        description="Solicitudes en tus áreas de servicio · tiempo real"
        title="Oportunidades">
        <View style={styles.headerRow}>
          <ActiveModeBanner mode="professional" />
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void publishedRequests.refetch();
            }}
            style={styles.refreshButton}>
            <AppText variant="small">↻ Actualizar</AppText>
          </Pressable>
        </View>

        <Spacer size="lg" />

        {opportunities.length === 0 ? (
          <EmptyState
            description="Cuando haya solicitudes en tus áreas de servicio, aparecerán aquí en tiempo real."
            title="Sin oportunidades por ahora"
          />
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={opportunities}
            keyExtractor={(item) => item.id}
            renderItem={renderOpportunity}
            scrollEnabled={false}
          />
        )}
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    gap: Spacing.sm,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  listContent: {
    gap: Spacing.md,
  },
});
