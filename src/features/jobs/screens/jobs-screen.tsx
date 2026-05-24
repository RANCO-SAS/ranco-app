import { FlatList, StyleSheet } from 'react-native';
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
import { ServiceRequestCard } from '@/features/jobs/components/service-request-card';
import { useClientServiceRequests } from '@/features/jobs/hooks/use-service-requests';
import { ActiveModeBanner } from '@/features/profile/components/active-mode-banner';
import { ModeGateEmptyState } from '@/features/profile/components/mode-gate-empty-state';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';

export function JobsScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const isClientMode = activeMode === 'client';
  const clientRequests = useClientServiceRequests(
    profile?.isClient && isClientMode ? profile.id : undefined,
  );

  if (clientRequests.isLoading) {
    return (
      <ScreenLayout loading loadingMessage="Cargando solicitudes..." safeArea="tab" />
    );
  }

  if (clientRequests.error) {
    return (
      <ScreenLayout safeArea="tab">
        <Section title="Mis solicitudes" description="Gestiona lo que has publicado como cliente.">
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
    <ScreenLayout safeArea="tab" scrollable>
      <Section
        title="Mis solicitudes"
        description="Publica y da seguimiento a tus trabajos como cliente.">
        <ActiveModeBanner mode="client" />
        <Spacer size="lg" />

        {!profile?.isClient ? (
          <EmptyState
            description="Activa el rol de cliente en tu perfil para publicar solicitudes."
            title="Rol cliente no activo"
          />
        ) : !isClientMode ? (
          <ModeGateEmptyState requiredMode="client" />
        ) : (
          <>
            <Button
              label="Nueva solicitud"
              onPress={() => router.push(Routes.app.createJob)}
            />
            <Spacer size="lg" />
            {requests.length === 0 ? (
              <EmptyState
                description="Publica tu primera solicitud para que los profesionales puedan encontrarla."
                title="No hay solicitudes activas"
              />
            ) : (
              <FlatList
                data={requests}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ServiceRequestCard
                    onPress={() => router.push(Routes.app.jobDetail(item.id))}
                    request={item}
                  />
                )}
                scrollEnabled={false}
                contentContainerStyle={styles.list}
              />
            )}
          </>
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
