import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { TabScreenHeader } from '@/components/layout/tab-screen-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StaggeredFadeIn, fadeInDownEntrance } from '@/components/ui/staggered-fade-in';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { JobOpportunityCard } from '@/features/jobs/components/discover/job-opportunity-card';
import { usePublishedServiceRequests } from '@/features/jobs/hooks/use-service-requests';
import { ModeGateEmptyState } from '@/features/profile/components/mode-gate-empty-state';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useStartConversation } from '@/features/messages/hooks/use-conversations';

export function DiscoverScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const isProfessionalMode = activeMode === 'professional';
  const startConversation = useStartConversation();

  const publishedRequests = usePublishedServiceRequests(
    Boolean(profile?.isProfessional && isProfessionalMode),
  );

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

  if (publishedRequests.isLoading) {
    return <ScreenLayout loading loadingMessage="Cargando oportunidades..." safeArea="tab" />;
  }

  if (publishedRequests.error) {
    return (
      <ScreenLayout safeArea="tab">
        <Animated.View entering={fadeInDownEntrance()}>
          <AppText variant="title">Oportunidades</AppText>
          <Spacer size="lg" />
          <Card>
            <AppText color="destructive" variant="body">
              No se pudieron cargar las oportunidades.
            </AppText>
          </Card>
        </Animated.View>
      </ScreenLayout>
    );
  }

  if (!profile?.isProfessional) {
    return (
      <ScreenLayout safeArea="tab">
        <StaggeredFadeIn index={0}>
          <AppText variant="title">Oportunidades</AppText>
          <Spacer size="lg" />
          <EmptyState title="Rol profesional inactivo" />
        </StaggeredFadeIn>
      </ScreenLayout>
    );
  }

  if (!isProfessionalMode) {
    return (
      <ScreenLayout safeArea="tab">
        <StaggeredFadeIn index={0}>
          <ModeGateEmptyState requiredMode="professional" />
        </StaggeredFadeIn>
      </ScreenLayout>
    );
  }

  if (professionalAreas.length === 0) {
    return (
      <ScreenLayout safeArea="tab">
        <StaggeredFadeIn index={0}>
          <AppText variant="title">Oportunidades</AppText>
          <Spacer size="lg" />
          <EmptyState title="Sin servicios configurados" />
          <Spacer size="md" />
          <Button
            label="Configurar servicios"
            onPress={() => router.push(Routes.app.activateProfessional)}
            variant="dark"
          />
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
              void publishedRequests.refetch();
            }}
            refreshing={publishedRequests.isRefetching}
          />
        ),
      }}>
      <Animated.View entering={fadeInDownEntrance()}>
        <TabScreenHeader
          subtitle="Explora solicitudes publicadas en tus áreas de servicio"
          title="Oportunidades"
          badge={
            opportunities.length > 0
              ? `${opportunities.length} ${opportunities.length === 1 ? 'DISPONIBLE' : 'DISPONIBLES'}`
              : undefined
          }
        />
      </Animated.View>

      <Spacer size="sm" />

      {opportunities.length === 0 ? (
        <StaggeredFadeIn index={0}>
          <EmptyState title="Sin oportunidades por ahora" />
        </StaggeredFadeIn>
      ) : (
        <View style={styles.listContent}>
          {opportunities.map((item, index) => (
            <StaggeredFadeIn index={index + 1} key={item.id}>
              <JobOpportunityCard
                isContactLoading={startConversation.isPending}
                onContactPress={() => handleContact(item.id, item.clientId)}
                onDetailsPress={() => router.push(Routes.app.jobDetail(item.id))}
                request={item}
              />
            </StaggeredFadeIn>
          ))}
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: Spacing.lg,
  },
});
