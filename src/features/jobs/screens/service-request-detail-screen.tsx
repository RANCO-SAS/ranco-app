import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout/stack-header';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';
import { Spacer } from '@/components/ui/spacer';
import { StaggeredFadeIn } from '@/components/ui/staggered-fade-in';
import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { SERVICE_REQUEST_STATUS_LABELS } from '@/features/jobs/constants/service-request-labels';
import { DetailSection } from '@/features/jobs/components/opportunity-detail/detail-section';
import { OpportunityClientRow } from '@/features/jobs/components/opportunity-detail/opportunity-client-row';
import { OpportunityLocationSection } from '@/features/jobs/components/opportunity-detail/opportunity-location-section';
import { JobEngagementPanel } from '@/features/jobs/components/job-engagement-panel';
import { ServiceRequestPhotoGallery } from '@/features/jobs/components/service-request-photo-gallery';
import { UrgencyBadge } from '@/features/jobs/components/urgency-badge';
import { useServiceRequest } from '@/features/jobs/hooks/use-service-requests';
import { useServiceRequestRealtime } from '@/features/jobs/hooks/use-service-request-realtime';
import { canClientEditServiceRequest } from '@/features/jobs/utils/can-client-edit-service-request';
import { useStartConversation } from '@/features/messages/hooks/use-conversations';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { ReviewForm } from '@/features/reviews/components/review-form';
import { useJobReview, useProfileReviews, selectRoleReviewSummary } from '@/features/reviews/hooks/use-reviews';
import { useTheme } from '@/hooks/use-theme';

export function ServiceRequestDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const requestQuery = useServiceRequest(id);
  const startConversation = useStartConversation();
  const request = requestQuery.data;

  useServiceRequestRealtime({
    requestId: request?.id,
    clientId: request?.clientId,
    assignedProfessionalId: request?.assignedProfessionalId ?? undefined,
    enabled: Boolean(request),
  });

  const jobReviewQuery = useJobReview(
    request?.id ?? id,
    request?.status === 'completed' ? profile?.id : undefined,
  );
  const assignedProfessionalQuery = useProfile(request?.assignedProfessionalId ?? undefined);
  const assignedProfessionalName = assignedProfessionalQuery.data?.fullName ?? 'Profesional';

  const isOwner = profile?.id === request?.clientId;
  const clientReviewsQuery = useProfileReviews(
    request && !isOwner && activeMode === 'professional' ? request.clientId : undefined,
  );
  const clientReviewSummary = selectRoleReviewSummary(clientReviewsQuery.data, 'client');

  if (requestQuery.isLoading) {
    return <ScreenLayout loading loadingMessage="Cargando solicitud..." />;
  }

  if (requestQuery.error || !request) {
    return (
      <ScreenLayout>
        <StackHeader title="Detalle de oportunidad" />
        <EmptyState
          description="Puede que la solicitud ya no esté abierta o no tengas acceso a ella."
          title="Solicitud no disponible"
        />
      </ScreenLayout>
    );
  }

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

  const showEngagementPanel =
    Boolean(profile?.id) &&
    (isAssignedProfessional ||
      (isOwner && request.status !== 'published' && request.status !== 'in_negotiation'));

  const showContactFooter = !isOwner && activeMode === 'professional' && canContact;
  const showUnavailableFooter = !isOwner && activeMode === 'professional' && !canContact;
  const showOwnerFooter = isOwner && activeMode === 'client' && canEditRequest;

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

  const footerVisible = showContactFooter || showUnavailableFooter || showOwnerFooter;

  return (
    <ScreenLayout flush scrollable={false}>
      <StackHeader applyTopInset title="Detalle de oportunidad" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          footerVisible && { paddingBottom: Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}>
        <StaggeredFadeIn index={0}>
          <View style={styles.titleRow}>
            <AppText style={styles.mainTitle} variant="title">
              {request.subcategoryName}
            </AppText>
            <UrgencyBadge urgency={request.urgency} />
          </View>
        </StaggeredFadeIn>

        <Spacer size="md" />

        <StaggeredFadeIn index={1}>
          <OpportunityClientRow
            client={request.client}
            createdAt={request.createdAt}
            rating={clientReviewSummary?.averageRating}
            reviewCount={clientReviewSummary?.totalReviews}
          />
        </StaggeredFadeIn>

        <Spacer size="lg" />

        <StaggeredFadeIn index={2}>
          <View style={[styles.statusCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <AppText color="primary" variant="caption">
              {SERVICE_REQUEST_STATUS_LABELS[request.status].toUpperCase()}
            </AppText>
            <AppText color="textSecondary" variant="caption">
              {request.categoryName}
            </AppText>
          </View>
        </StaggeredFadeIn>

        <Spacer size="xl" />

        <StaggeredFadeIn index={3}>
          <DetailSection icon="document-text-outline" title="Descripción">
            <AppText color="textSecondary" variant="body">
              {request.description}
            </AppText>
            {request.title !== request.subcategoryName ? (
              <>
                <Spacer size="sm" />
                <AppText color="textMuted" variant="caption">
                  {request.title}
                </AppText>
              </>
            ) : null}
          </DetailSection>
        </StaggeredFadeIn>

        {request.locationLabel ? (
          <>
            <Spacer size="xl" />
            <StaggeredFadeIn index={4}>
              <DetailSection icon="location-outline" title="Ubicación">
                <OpportunityLocationSection locationLabel={request.locationLabel} />
              </DetailSection>
            </StaggeredFadeIn>
          </>
        ) : null}

        {request.photoUrls.length > 0 ? (
          <>
            <Spacer size="xl" />
            <StaggeredFadeIn index={5}>
              <DetailSection icon="camera-outline" title="Fotos del problema">
                <ServiceRequestPhotoGallery photoUrls={request.photoUrls} />
              </DetailSection>
            </StaggeredFadeIn>
          </>
        ) : null}

        {showEngagementPanel && profile?.id ? (
          <>
            <Spacer size="xl" />
            <StaggeredFadeIn index={6}>
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
            </StaggeredFadeIn>
          </>
        ) : null}

        {request.status === 'completed' && revieweeId && profile?.id ? (
          <>
            <Spacer size="xl" />
            <StaggeredFadeIn index={7}>
              {jobReviewQuery.isLoading ? (
                <Card>
                  <Loader message="Cargando reseña..." size="small" variant="inline" />
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
            </StaggeredFadeIn>
          </>
        ) : null}

        {isOwner && activeMode === 'client' && !canEditRequest ? (
          <>
            <Spacer size="xl" />
            <StaggeredFadeIn index={8}>
              <Card>
                <AppText variant="bodyMedium">Tu solicitud</AppText>
                <Spacer size="xs" />
                <AppText color="textSecondary" variant="caption">
                  Gestiona el estado del trabajo y revisa los mensajes con profesionales interesados.
                </AppText>
              </Card>
            </StaggeredFadeIn>
          </>
        ) : null}
      </ScrollView>

      {footerVisible ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.border,
              paddingBottom: Math.max(insets.bottom, Spacing.md),
            },
          ]}>
          {showContactFooter ? (
            <Button
              disabled={startConversation.isPending}
              label={startConversation.isPending ? 'Abriendo chat...' : 'Contactar cliente'}
              onPress={handleContact}
            />
          ) : null}

          {showOwnerFooter ? (
            <Button
              label="Editar solicitud"
              onPress={() => router.push(Routes.app.editJob(request.id))}
              variant="secondary"
            />
          ) : null}

          {showUnavailableFooter ? (
            <Card>
              <AppText variant="bodyMedium">Solicitud no disponible</AppText>
              <Spacer size="xs" />
              <AppText color="textSecondary" variant="caption">
                {request.assignedProfessionalId && request.assignedProfessionalId !== profile?.id
                  ? 'El cliente ya seleccionó a otro profesional.'
                  : 'Esta solicitud ya no acepta nuevos contactos o ya avanzó de estado.'}
              </AppText>
            </Card>
          ) : null}
        </View>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  mainTitle: {
    flex: 1,
  },
  statusCard: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
});
