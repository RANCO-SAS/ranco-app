import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { JobOpportunityCard } from '@/features/jobs/components/discover/job-opportunity-card';
import { usePublishedServiceRequests } from '@/features/jobs/hooks/use-service-requests';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';
import { useStartConversation } from '@/features/messages/hooks/use-conversations';
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
    return (
      <ScreenLayout loading loadingMessage="Cargando..." safeArea="tab" />
    );
  }

  if (publishedRequests.error) {
    return (
      <ScreenLayout safeArea="tab">
        <Section title="Oportunidades">
          <Card>
            <AppText color="destructive" variant="body">
              No se pudieron cargar las oportunidades.
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
          <EmptyState title="Rol profesional inactivo" />
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
          <EmptyState title="Sin servicios configurados" />
          <Spacer size="md" />
          <Button
            label="Configurar servicios"
            onPress={() => router.push(Routes.app.activateProfessional)}
            variant="dark"
          />
        </Section>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout safeArea="tab" scrollable>
      <Section title="Oportunidades">
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void publishedRequests.refetch();
          }}
          style={styles.refreshButton}>
          <AppText variant="small">↻ Actualizar</AppText>
        </Pressable>

        <Spacer size="lg" />

        {opportunities.length === 0 ? (
          <EmptyState title="Sin oportunidades" />
        ) : (
          <View style={styles.listContent}>
            {opportunities.map((item) => (
              <JobOpportunityCard
                key={item.id}
                isContactLoading={startConversation.isPending}
                onContactPress={() => handleContact(item.id, item.clientId)}
                onDetailsPress={() => router.push(Routes.app.jobDetail(item.id))}
                request={item}
              />
            ))}
          </View>
        )}
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  refreshButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  listContent: {
    gap: Spacing.md,
  },
});
