import { useLocalSearchParams, useRouter } from 'expo-router';

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
import { ServiceRequestAuthorHeader } from '@/features/jobs/components/service-request-author-header';
import { ServiceRequestPhotoGallery } from '@/features/jobs/components/service-request-photo-gallery';
import { useServiceRequest } from '@/features/jobs/hooks/use-service-requests';
import { canClientEditServiceRequest } from '@/features/jobs/utils/can-client-edit-service-request';
import { useStartConversation } from '@/features/messages/hooks/use-conversations';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { ReviewForm } from '@/features/reviews/components/review-form';
import { useJobReview } from '@/features/reviews/hooks/use-reviews';

export function ServiceRequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const requestQuery = useServiceRequest(id);
  const startConversation = useStartConversation();
  const request = requestQuery.data;
  const jobReviewQuery = useJobReview(
    request?.id ?? id,
    request?.status === 'completed' ? profile?.id : undefined,
  );
  const assignedProfessionalQuery = useProfile(request?.assignedProfessionalId ?? undefined);
  const assignedProfessionalName = assignedProfessionalQuery.data?.fullName ?? 'Profesional';

  if (requestQuery.isLoading) {
    return <ScreenLayout loading loadingMessage="Cargando solicitud..." />;
  }

  if (requestQuery.error || !request) {
    return (
      <ScreenLayout>
        <StackHeader title="Solicitud" />
        <EmptyState
          description="Puede que la solicitud ya no esté abierta o no tengas acceso a ella."
          title="Solicitud no disponible"
        />
      </ScreenLayout>
    );
  }

  const isOwner = profile?.id === request.clientId;
  const isAssignedProfessional = profile?.id === request.assignedProfessionalId;
  const canContact =
    !isOwner &&
    activeMode === 'professional' &&
    profile?.isProfessional &&
    (request.status === 'published' || request.status === 'in_negotiation') &&
    (!request.assignedProfessionalId || request.assignedProfessionalId === profile.id);

  const revieweeId = isOwner ? request.assignedProfessionalId : request.clientId;
  const canEditRequest =
    isOwner && activeMode === 'client' && canClientEditServiceRequest(request.status);

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
        <ServiceRequestAuthorHeader
          client={request.client}
          createdAt={request.createdAt}
          subtitle={`${request.categoryName} · ${SERVICE_REQUEST_URGENCY_LABELS[request.urgency]}`}
        />
        <Spacer size="md" />
        <AppText variant="title">{request.title}</AppText>
        <Spacer size="sm" />
        <AppText variant="body" color="textSecondary">
          {request.description}
        </AppText>
        {request.photoUrls.length > 0 ? (
          <>
            <Spacer size="md" />
            <ServiceRequestPhotoGallery photoUrls={request.photoUrls} />
          </>
        ) : null}
        <Spacer size="md" />
        <AppText variant="small" color="textMuted">
          Estado: {SERVICE_REQUEST_STATUS_LABELS[request.status]}
        </AppText>
      {request.locationLabel ? (
          <AppText variant="small" color="textMuted">
            Ubicación: {request.locationLabel}
          </AppText>
        ) : null}
      </Card>

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
            professionalName={
              isOwner ? assignedProfessionalName : profile.fullName || 'Profesional'
            }
            requestId={request.id}
            status={request.status}
            userId={profile.id}
          />
          <Spacer size="md" />
        </>
      ) : null}

      {request.status === 'completed' && revieweeId && profile?.id ? (
        <>
          {jobReviewQuery.isLoading ? (
            <Card>
              <AppText color="textSecondary" variant="caption">
                Cargando reseña...
              </AppText>
            </Card>
          ) : (
            <ReviewForm
              existingReview={jobReviewQuery.data}
              revieweeId={revieweeId}
              revieweeIsProfessional={isOwner}
              revieweeName={isOwner ? assignedProfessionalName : 'el cliente'}
              reviewerId={profile.id}
              serviceRequestId={request.id}
            />
          )}
          <Spacer size="md" />
        </>
      ) : null}

      {isOwner && activeMode === 'client' ? (
        <>
          {canEditRequest ? (
            <>
              <Button
                label="Editar solicitud"
                onPress={() => router.push(Routes.app.editJob(request.id))}
                variant="secondary"
              />
              <Spacer size="md" />
            </>
          ) : null}
          <Card>
            <AppText variant="bodyMedium">Tu solicitud</AppText>
            <Spacer size="xs" />
            <AppText variant="caption" color="textSecondary">
              Gestiona el estado del trabajo y revisa los mensajes con profesionales interesados.
            </AppText>
          </Card>
        </>
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
                {request.assignedProfessionalId && request.assignedProfessionalId !== profile?.id
                  ? 'El cliente ya seleccionó a otro profesional.'
                  : 'Esta solicitud ya no acepta nuevos contactos o ya avanzó de estado.'}
              </AppText>
            </Card>
          )}
        </>
      ) : null}
    </ScreenLayout>
  );
}
