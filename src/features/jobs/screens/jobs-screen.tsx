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
      <ScreenLayout loading loadingMessage="Cargando..." safeArea="tab" />
    );
  }

  if (clientRequests.error) {
    return (
      <ScreenLayout safeArea="tab">
        <Section title="Mis solicitudes">
          <Card>
            <AppText variant="body" color="destructive">
              No se pudieron cargar las solicitudes.
            </AppText>
          </Card>
        </Section>
      </ScreenLayout>
    );
  }

  const requests = clientRequests.data ?? [];

  return (
    <ScreenLayout safeArea="tab" scrollable>
      <Section title="Mis solicitudes">
        {!profile?.isClient ? (
          <EmptyState title="Rol cliente inactivo" />
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
              <EmptyState title="Sin solicitudes" />
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
