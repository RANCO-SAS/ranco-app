import { FlatList, StyleSheet } from 'react-native';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { ServiceRequestCard } from '@/features/jobs/components/service-request-card';
import { useClientServiceRequests } from '@/features/jobs/hooks/use-service-requests';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';

export function JobsScreen() {
  const { profile } = useCurrentProfile();
  const clientRequests = useClientServiceRequests(profile?.isClient ? profile.id : undefined);

  if (clientRequests.isLoading) {
    return (
      <ScreenLayout loading loadingMessage="Cargando solicitudes..." />
    );
  }

  if (clientRequests.error) {
    return (
      <ScreenLayout>
        <Section title="Trabajos" description="Gestiona tus solicitudes de servicio.">
          <Card>
            <AppText variant="body" color="destructive">
              No pudimos cargar tus solicitudes. Inténtalo de nuevo.
            </AppText>
          </Card>
        </Section>
      </ScreenLayout>
    );
  }

  const requests = clientRequests.data ?? [];

  return (
    <ScreenLayout>
      <Section
        title="Trabajos"
        description="Gestiona solicitudes, ofertas y trabajos en curso.">
        {!profile?.isClient ? (
          <EmptyState
            description="Activa el rol de cliente en tu perfil para publicar solicitudes."
            title="Modo cliente no activo"
          />
        ) : requests.length === 0 ? (
          <EmptyState
            description="Tus solicitudes publicadas y trabajos aceptados se mostrarán aquí."
            title="No hay trabajos activos"
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
