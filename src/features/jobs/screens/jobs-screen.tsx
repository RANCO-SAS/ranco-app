import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { AppIcon } from '@/components/ui/app-icon';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StaggeredFadeIn } from '@/components/ui/staggered-fade-in';
import { AppText } from '@/components/ui/text';
import { ClientRequestTabs } from '@/features/jobs/components/client-request-tabs';
import { ClientServiceRequestCard } from '@/features/jobs/components/client-service-request-card';
import { useClientJobsRealtime } from '@/features/jobs/hooks/use-client-jobs-realtime';
import { useClientServiceRequests } from '@/features/jobs/hooks/use-service-requests';
import {
  countClientRequestsByTab,
  filterClientRequestsByTab,
  type ClientRequestTab,
} from '@/features/jobs/utils/group-client-service-requests';
import { ModeGateEmptyState } from '@/features/profile/components/mode-gate-empty-state';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { Routes } from '@/constants/routes';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const EMPTY_STATE_COPY: Record<ClientRequestTab, { title: string; description: string }> = {
  active: {
    title: 'Sin solicitudes activas',
    description: 'Cuando publiques o gestiones un servicio en curso, aparecerá aquí.',
  },
  scheduled: {
    title: 'Sin servicios programados',
    description: 'Las solicitudes confirmadas con un profesional asignado se mostrarán aquí.',
  },
  history: {
    title: 'Sin historial',
    description: 'Tus solicitudes completadas o canceladas aparecerán en esta sección.',
  },
};

export function JobsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const [activeTab, setActiveTab] = useState<ClientRequestTab>('active');
  const isClientMode = activeMode === 'client';
  const clientRequests = useClientServiceRequests(
    profile?.isClient && isClientMode ? profile.id : undefined,
  );

  useClientJobsRealtime({
    clientId: profile?.isClient && isClientMode ? profile.id : undefined,
    enabled: Boolean(profile?.isClient && isClientMode),
  });

  const requests = clientRequests.data ?? [];

  const tabCounts = useMemo(
    () => ({
      active: countClientRequestsByTab(requests, 'active'),
      scheduled: countClientRequestsByTab(requests, 'scheduled'),
      history: countClientRequestsByTab(requests, 'history'),
    }),
    [requests],
  );

  const filteredRequests = useMemo(
    () => filterClientRequestsByTab(requests, activeTab),
    [activeTab, requests],
  );

  if (clientRequests.isLoading) {
    return <ScreenLayout loading loadingMessage="Cargando solicitudes..." safeArea="tab" />;
  }

  if (clientRequests.error) {
    return (
      <ScreenLayout safeArea="tab">
        <View style={styles.headerRow}>
          <AppText variant="title">Mis solicitudes</AppText>
        </View>
        <Card>
          <AppText color="destructive" variant="body">
            No se pudieron cargar las solicitudes.
          </AppText>
        </Card>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout safeArea="tab" scrollable>
      <View style={styles.headerRow}>
        <AppText style={styles.title} variant="title">
          Mis solicitudes
        </AppText>
        {profile?.isClient && isClientMode ? (
          <Pressable
            accessibilityLabel="Nueva solicitud"
            accessibilityRole="button"
            onPress={() => router.push(Routes.app.createJob)}
            style={[styles.fab, { backgroundColor: theme.primary }]}>
            <AppIcon color={theme.primaryForeground} name="add" size={24} />
          </Pressable>
        ) : null}
      </View>

      {!profile?.isClient ? (
        <EmptyState title="Rol cliente inactivo" />
      ) : !isClientMode ? (
        <ModeGateEmptyState requiredMode="client" />
      ) : (
        <>
          <ClientRequestTabs activeTab={activeTab} counts={tabCounts} onChange={setActiveTab} />

          <View style={styles.list}>
            {filteredRequests.length === 0 ? (
              <StaggeredFadeIn index={0}>
                <EmptyState
                  description={EMPTY_STATE_COPY[activeTab].description}
                  title={EMPTY_STATE_COPY[activeTab].title}
                />
              </StaggeredFadeIn>
            ) : (
              filteredRequests.map((item, index) => (
                <StaggeredFadeIn index={index} key={item.id}>
                  <ClientServiceRequestCard
                    onPress={() => router.push(Routes.app.jobDetail(item.id))}
                    request={item}
                  />
                </StaggeredFadeIn>
              ))
            )}
          </View>
        </>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    flex: 1,
  },
  fab: {
    width: Layout.minTouchTarget,
    height: Layout.minTouchTarget,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: Spacing.md,
    paddingTop: Spacing.lg,
  },
});
