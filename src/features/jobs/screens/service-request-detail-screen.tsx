import { useLocalSearchParams, useRouter } from 'expo-router';

import { StaticLocationMap } from '@/components/map/static-location-map';
import { StackHeader } from '@/components/layout/stack-header';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import {
  SERVICE_REQUEST_STATUS_LABELS,
  SERVICE_REQUEST_URGENCY_LABELS,
} from '@/features/jobs/constants/service-request-labels';
import { JobEngagementPanel } from '@/features/jobs/components/job-engagement-panel';
import { useServiceRequest } from '@/features/jobs/hooks/use-service-requests';
import { useStartConversation } from '@/features/messages/hooks/use-conversations';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { ReviewForm } from '@/features/reviews/components/review-form';
import { useJobReview } from '@/features/reviews/hooks/use-reviews';

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
  const isAssignedProfessional = profile?.id === request.assignedProfessionalId;
  const canContact =
    !isOwner &&
    activeMode === 'professional' &&
    profile?.isProfessional &&
    (request.status === 'published' || request.status === 'in_negotiation');

  const revieweeId = isOwner ? request.assignedProfessionalId : request.clientId;
  const jobReviewQuery = useJobReview(
    request.id,
    request.status === 'completed' ? profile?.id : undefined,
  );

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
          Estado: {SERVICE_REQUEST_STATUS_LABELS[request.status]}
        </AppText>
        <AppText variant="small" color="textMuted">
          Urgencia: {SERVICE_REQUEST_URGENCY_LABELS[request.urgency]}
        </AppText>
      {request.locationLabel ? (
          <AppText variant="small" color="textMuted">
            Ubicación: {request.locationLabel}
          </AppText>
        ) : null}
      </Card>

      <Spacer size="md" />
      <StaticLocationMap
        latitude={request.locationLat}
        longitude={request.locationLng}
        title={request.locationLabel ?? request.title}
      />

      <Spacer size="md" />

      {profile?.id &&
      (isAssignedProfessional ||
        (isOwner &&
          request.status !== 'published' &&
          request.status !== 'in_negotiation')) ? (
        <>
          <JobEngagementPanel
            assignedProfessionalId={request.assignedProfessionalId}
            clientId={request.clientId}
            isClient={isOwner}
            professionalId={request.assignedProfessionalId ?? profile.id}
            requestId={request.id}
            status={request.status}
            userId={profile.id}
          />
          <Spacer size="md" />
        </>
      ) : null}

      {request.status === 'completed' && revieweeId && profile?.id ? (
        <>
          <ReviewForm
            existingRating={jobReviewQuery.data?.rating}
            revieweeId={revieweeId}
            revieweeName={isOwner ? 'el profesional' : 'el cliente'}
            reviewerId={profile.id}
            serviceRequestId={request.id}
          />
          <Spacer size="md" />
        </>
      ) : null}

      {isOwner && activeMode === 'client' ? (
        <Card>
          <AppText variant="bodyMedium">Tu solicitud</AppText>
          <Spacer size="xs" />
          <AppText variant="caption" color="textSecondary">
            Gestiona el estado del trabajo y revisa los mensajes con profesionales interesados.
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
                Esta solicitud ya no acepta nuevos contactos o ya avanzó de estado.
              </AppText>
            </Card>
          )}
        </>
      ) : null}
    </ScreenLayout>
  );
}
