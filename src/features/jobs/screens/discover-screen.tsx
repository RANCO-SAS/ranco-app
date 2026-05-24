import { FlatList, StyleSheet } from 'react-native';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { ServiceRequestCard } from '@/features/jobs/components/service-request-card';
import { usePublishedServiceRequests } from '@/features/jobs/hooks/use-service-requests';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useAppStore } from '@/stores/app-store';

export function DiscoverScreen() {
  const { profile } = useCurrentProfile();
  const activeMode = useAppStore((state) => state.activeMode);
  const isProfessionalView =
    activeMode === 'professional' || (!profile?.isClient && Boolean(profile?.isProfessional));

  const publishedRequests = usePublishedServiceRequests(
    Boolean(profile?.isProfessional && isProfessionalView),
  );

  if (publishedRequests.isLoading) {
    return (
      <ScreenLayout loading loadingMessage="Buscando oportunidades..." />
    );
  }

  if (publishedRequests.error) {
    return (
      <ScreenLayout>
        <Section title="Explorar" description="Descubre oportunidades cerca de ti.">
          <Card>
            <AppText variant="body" color="destructive">
              No pudimos cargar oportunidades. Inténtalo de nuevo.
            </AppText>
          </Card>
        </Section>
      </ScreenLayout>
    );
  }

  const requests = publishedRequests.data ?? [];

  return (
    <ScreenLayout>
      <Section
        title="Explorar"
        description="Descubre oportunidades y profesionales cerca de ti.">
        {!profile?.isProfessional ? (
          <EmptyState
            description="Activa el rol de profesional en tu perfil para ver oportunidades."
            title="Modo profesional no activo"
          />
        ) : !isProfessionalView ? (
          <EmptyState
            description="Cambia al modo profesional en tu perfil para explorar solicitudes."
            title="Estás en modo cliente"
          />
        ) : requests.length === 0 ? (
          <EmptyState
            description="Cuando haya solicitudes disponibles cerca, aparecerán aquí."
            title="Sin oportunidades por ahora"
          />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ServiceRequestCard request={item} />}
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
