import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { UberListRow } from '@/components/ui/uber-list-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { AppText } from '@/components/ui/text';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { Radius, Spacing } from '@/constants/theme';
import { usePublishedServiceRequests } from '@/features/jobs/hooks/use-service-requests';
import { useStartConversation } from '@/features/messages/hooks/use-conversations';
import { ActiveModeBanner } from '@/features/profile/components/active-mode-banner';
import { ModeGateEmptyState } from '@/features/profile/components/mode-gate-empty-state';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { getCategoryIcon } from '@/features/jobs/utils/category-icons';
import { useTheme } from '@/hooks/use-theme';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';

const URGENCY_LABELS: Record<ServiceRequest['urgency'], string> = {
  low: 'Flexible',
  normal: 'Normal',
  high: 'Pronto',
  urgent: 'Urgente',
};

export function DiscoverScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const isProfessionalMode = activeMode === 'professional';
  const startConversation = useStartConversation();

  const publishedRequests = usePublishedServiceRequests(
    Boolean(profile?.isProfessional && isProfessionalMode),
  );

  const professionalAreas = profile?.professionalSubcategoryIds ?? [];

  const requests = useMemo(() => {
    if (!profile) {
      return [];
    }

    return (publishedRequests.data ?? []).filter(
      (request) =>
        request.clientId !== profile.id &&
        professionalAreas.includes(request.subcategoryId),
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
      <ScreenLayout loading loadingMessage="Buscando oportunidades..." />
    );
  }

  if (publishedRequests.error) {
    return (
      <ScreenLayout>
        <View style={styles.header}>
          <AppText variant="title">Oportunidades</AppText>
        </View>
        <Card>
          <AppText color="destructive" variant="body">
            No pudimos cargar oportunidades. Inténtalo de nuevo.
          </AppText>
        </Card>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable>
      <View style={styles.header}>
        <AppText variant="title">Oportunidades</AppText>
        <AppText color="textSecondary" variant="body">
          {requests.length} disponibles en tus áreas
        </AppText>
      </View>

      <ActiveModeBanner mode="professional" />
      <Spacer size="lg" />

      {!profile?.isProfessional ? (
        <EmptyState
          description="Activa el rol de profesional en tu perfil para ver oportunidades."
          title="Rol profesional no activo"
        />
      ) : !isProfessionalMode ? (
        <ModeGateEmptyState requiredMode="professional" />
      ) : professionalAreas.length === 0 ? (
        <>
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
        </>
      ) : requests.length === 0 ? (
        <EmptyState
          description="Cuando haya solicitudes en tus áreas de servicio, aparecerán aquí."
          title="Sin oportunidades por ahora"
        />
      ) : (
        <View style={[styles.panel, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View>
                <UberListRow
                  isLast={index === requests.length - 1}
                  leading={
                    <AppText style={styles.leadingIcon}>{getCategoryIcon('other')}</AppText>
                  }
                  onPress={() => router.push(Routes.app.jobDetail(item.id))}
                  subtitle={`${item.categoryName} · ${URGENCY_LABELS[item.urgency]}${
                    item.locationLabel ? ` · ${item.locationLabel}` : ''
                  }`}
                  title={item.title}
                />
                <View style={styles.actionRow}>
                  <Button
                    disabled={startConversation.isPending}
                    label={startConversation.isPending ? 'Abriendo...' : 'Contactar'}
                    onPress={() => handleContact(item.id, item.clientId)}
                    size="md"
                    variant="dark"
                  />
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  panel: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  leadingIcon: {
    fontSize: 22,
    lineHeight: 26,
  },
  actionRow: {
    paddingBottom: Spacing.md,
    marginTop: -Spacing.sm,
  },
});
