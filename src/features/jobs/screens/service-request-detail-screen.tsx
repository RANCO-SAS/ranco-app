import { useLocalSearchParams, useRouter } from 'expo-router';

import { StackHeader } from '@/components/layout/stack-header';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { useServiceRequest } from '@/features/jobs/hooks/use-service-requests';
import { useStartConversation } from '@/features/messages/hooks/use-conversations';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';

const STATUS_LABELS = {
  published: 'Publicada',
  in_negotiation: 'En negociación',
  accepted: 'Aceptada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
} as const;

const URGENCY_LABELS = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
} as const;

export function ServiceRequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const requestQuery = useServiceRequest(id);
  const startConversation = useStartConversation();

  if (requestQuery.isLoading) {
    return <ScreenLayout loading loadingMessage="Cargando solicitud..." />;
  }

  if (requestQuery.error || !requestQuery.data) {
    return (
      <ScreenLayout>
        <StackHeader title="Solicitud" />
        <EmptyState
          description="No encontramos esta solicitud o no tienes acceso."
          title="Solicitud no disponible"
        />
      </ScreenLayout>
    );
  }

  const request = requestQuery.data;
  const isOwner = profile?.id === request.clientId;
  const canContact =
    !isOwner &&
    activeMode === 'professional' &&
    profile?.isProfessional &&
    request.status === 'published';

  const handleContact = () => {
    if (!profile) {
      return;
    }

    startConversation.mutate(
      {
        serviceRequestId: request.id,
        clientId: request.clientId,
        professionalId: profile.id,
      },
      {
        onSuccess: (conversation) => {
          router.push(Routes.app.conversation(conversation.id));
        },
      },
    );
  };

  return (
    <ScreenLayout scrollable>
      <StackHeader title="Detalle" />

      <Spacer size="md" />

      <Card>
        <AppText variant="caption" color="primary">
          {request.categoryName} · {request.subcategoryName}
        </AppText>
        <Spacer size="xs" />
        <AppText variant="title">{request.title}</AppText>
        <Spacer size="sm" />
        <AppText variant="body" color="textSecondary">
          {request.description}
        </AppText>
        <Spacer size="md" />
        <AppText variant="small" color="textMuted">
          Estado: {STATUS_LABELS[request.status]}
        </AppText>
        <AppText variant="small" color="textMuted">
          Urgencia: {URGENCY_LABELS[request.urgency]}
        </AppText>
        {request.locationLabel ? (
          <AppText variant="small" color="textMuted">
            Ubicación: {request.locationLabel}
          </AppText>
        ) : null}
      </Card>

      <Spacer size="md" />

      {isOwner && activeMode === 'client' ? (
        <Card>
          <AppText variant="bodyMedium">Tu solicitud está publicada</AppText>
          <Spacer size="xs" />
          <AppText variant="caption" color="textSecondary">
            Los profesionales pueden verla en Explorar y contactarte por mensajes.
          </AppText>
        </Card>
      ) : null}

      {!isOwner && activeMode === 'professional' ? (
        <>
          {canContact ? (
            <Button
              disabled={startConversation.isPending}
              label={startConversation.isPending ? 'Abriendo chat...' : 'Contactar cliente'}
              onPress={handleContact}
            />
          ) : (
            <Card>
              <AppText variant="bodyMedium">Solicitud no disponible</AppText>
              <Spacer size="xs" />
              <AppText variant="caption" color="textSecondary">
                Esta solicitud ya no está publicada o no puedes contactar al cliente.
              </AppText>
            </Card>
          )}
        </>
      ) : null}
    </ScreenLayout>
  );
}
