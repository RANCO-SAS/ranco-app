import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StackHeader } from '@/components/layout/stack-header';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ImagePreviewModal } from '@/components/ui/image-preview-modal';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { ProfileSegmentTabs } from '@/features/profile/components/profile-segment-tabs';
import { useUserJobHistory } from '@/features/profile/hooks/use-user-job-history';
import { useProfile } from '@/features/profile/hooks/use-profile';
import type { PublicProfileTab } from '@/features/profile/types/profile.types';
import { useServiceCategories } from '@/features/jobs/hooks/use-service-categories';
import { ReviewSummaryCard } from '@/features/reviews/components/review-summary-card';
import { WorkShowcaseCard } from '@/features/reviews/components/work-showcase-card';
import {
  CLIENT_REVIEW_TRAITS,
  isProfessionalReview,
  PROFESSIONAL_REVIEW_TRAITS,
} from '@/features/reviews/constants/review-traits';
import { useProfileReviews, useRatedJobs, useReviewPortfolio, selectRoleReviewSummary } from '@/features/reviews/hooks/use-reviews';
import { useProfileReviewsRealtime } from '@/features/reviews/hooks/use-profile-reviews-realtime';

type PublicProfileParams = {
  userId: string;
  view?: 'client' | 'professional';
};

function resolvePrimaryRole(
  view: PublicProfileParams['view'],
  isClient: boolean,
  isProfessional: boolean,
): 'client' | 'professional' {
  if (view === 'client' && isClient) {
    return 'client';
  }

  if (view === 'professional' && isProfessional) {
    return 'professional';
  }

  if (isProfessional) {
    return 'professional';
  }

  return 'client';
}

export function PublicProfileScreen() {
  const router = useRouter();
  const { userId, view } = useLocalSearchParams<PublicProfileParams>();
  const [activeTab, setActiveTab] = useState<PublicProfileTab>('summary');
  const [isAvatarPreviewVisible, setIsAvatarPreviewVisible] = useState(false);
  const profileQuery = useProfile(userId);
  const profile = profileQuery.data;
  const primaryRole = profile
    ? resolvePrimaryRole(view, profile.isClient, profile.isProfessional)
    : 'client';
  const reviewsQuery = useProfileReviews(userId);
  useProfileReviewsRealtime({
    enabled: Boolean(userId),
    userId,
  });
  const portfolioQuery = useReviewPortfolio(userId);
  const ratedJobsQuery = useRatedJobs(userId, primaryRole);
  const jobHistoryQuery = useUserJobHistory(userId);
  const categoriesQuery = useServiceCategories();
  const roleSummary = selectRoleReviewSummary(reviewsQuery.data, primaryRole);
  const roleLabel = primaryRole === 'professional' ? 'como profesional' : 'como cliente';

  const professionalServices = useMemo(() => {
    if (!profile) {
      return [];
    }

    const subcategoryMap = new Map(
      (categoriesQuery.data ?? []).flatMap((category) =>
        category.subcategories.map((subcategory) => [subcategory.id, subcategory.name]),
      ),
    );

    return profile.professionalSubcategoryIds
      .map((subcategoryId) => subcategoryMap.get(subcategoryId))
      .filter((name): name is string => Boolean(name));
  }, [categoriesQuery.data, profile]);

  const clientJobs = (jobHistoryQuery.data ?? []).filter((job) => job.role === 'client');
  const professionalJobs = (jobHistoryQuery.data ?? []).filter(
    (job) => job.role === 'professional',
  );

  const traitDefinitions =
    primaryRole === 'professional' ? PROFESSIONAL_REVIEW_TRAITS : CLIENT_REVIEW_TRAITS;

  if (profileQuery.isLoading) {
    return <ScreenLayout loading loadingMessage="Cargando perfil..." />;
  }

  if (profileQuery.error || !profile) {
    return (
      <ScreenLayout>
        <StackHeader title="Perfil" />
        <EmptyState title="Perfil no disponible" />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable>
      <StackHeader title="Perfil" />

      <Spacer size="md" />

      <Card>
        {profile.avatarUrl ? (
          <Pressable
            accessibilityLabel="Ver foto de perfil"
            accessibilityRole="button"
            onPress={() => setIsAvatarPreviewVisible(true)}
            style={styles.avatarButton}>
            <Avatar imageUrl={profile.avatarUrl} name={profile.fullName} size={72} />
          </Pressable>
        ) : (
          <Avatar imageUrl={profile.avatarUrl} name={profile.fullName} size={72} />
        )}
        <Spacer size="md" />
        <AppText variant="title">{profile.fullName || 'Usuario'}</AppText>
        {profile.locationLabel ? (
          <>
            <Spacer size="sm" />
            <AppText color="textSecondary" variant="body">
              {profile.locationLabel}
            </AppText>
          </>
        ) : null}
        <Spacer size="sm" />
        <AppText color="textSecondary" variant="caption">
          {profile.isClient ? 'Cliente' : null}
          {profile.isClient && profile.isProfessional ? ' · ' : null}
          {profile.isProfessional ? 'Profesional' : null}
        </AppText>
        {roleSummary && roleSummary.totalReviews > 0 ? (
          <>
            <Spacer size="sm" />
            <AppText color="textSecondary" variant="caption">
              {roleSummary.averageRating.toFixed(1)}★ · {roleSummary.totalReviews} reseñas{' '}
              {roleLabel}
            </AppText>
          </>
        ) : null}
      </Card>

      {profile.avatarUrl ? (
        <ImagePreviewModal
          imageUrl={profile.avatarUrl}
          onClose={() => setIsAvatarPreviewVisible(false)}
          title={profile.fullName || 'Foto de perfil'}
          visible={isAvatarPreviewVisible}
        />
      ) : null}

      <Spacer size="lg" />

      <ProfileSegmentTabs activeTab={activeTab} onChange={setActiveTab} />

      <Spacer size="lg" />

      {activeTab === 'summary' ? (
        <Section title="Resumen">
          <Card>
            <AppText variant="bodyMedium">
              {primaryRole === 'professional' ? 'Perfil profesional' : 'Perfil de cliente'}
            </AppText>
            <Spacer size="sm" />
            {primaryRole === 'professional' ? (
              professionalServices.length > 0 ? (
                <AppText color="textSecondary" variant="body">
                  Servicios: {professionalServices.join(', ')}
                </AppText>
              ) : (
                <AppText color="textSecondary" variant="body">
                  Sin servicios configurados
                </AppText>
              )
            ) : (
              <AppText color="textSecondary" variant="body">
                {clientJobs.length} solicitudes completadas
              </AppText>
            )}
            {primaryRole === 'professional' ? (
              <>
                <Spacer size="sm" />
                <AppText color="textSecondary" variant="body">
                  {professionalJobs.length} trabajos realizados
                </AppText>
              </>
            ) : null}
          </Card>

          {roleSummary && roleSummary.totalReviews > 0 ? (
            <>
              <Spacer size="md" />
              <Card>
                <AppText variant="bodyMedium">Valoración destacada</AppText>
                <Spacer size="sm" />
                {traitDefinitions.map((definition) => {
                  const value = roleSummary.traitAverages[definition.key];
                  if (!value) {
                    return null;
                  }

                  return (
                    <View key={definition.key} style={styles.summaryTraitRow}>
                      <AppText color="textSecondary" variant="body">
                        {definition.label}
                      </AppText>
                      <AppText variant="bodyMedium">{value.toFixed(1)}★</AppText>
                    </View>
                  );
                })}
              </Card>
              <Spacer size="md" />
              <AppText variant="bodyMedium">Reseñas recientes</AppText>
              <Spacer size="sm" />
              {roleSummary.reviews.slice(0, 3).map((review) => (
                <Pressable
                  key={review.id}
                  accessibilityRole="button"
                  onPress={() => router.push(Routes.app.reviewDetail(review.id))}
                  style={styles.reviewCard}>
                  <Card>
                    <ReviewSummaryCard
                      review={review}
                      revieweeIsProfessional={isProfessionalReview(review)}
                      showNavigateHint
                    />
                  </Card>
                </Pressable>
              ))}
            </>
          ) : null}
        </Section>
      ) : null}

      {activeTab === 'reviews' ? (
        <Section title="Reseñas">
          {reviewsQuery.isLoading ? (
            <AppText color="textSecondary" variant="body">
              Cargando reseñas...
            </AppText>
          ) : roleSummary && roleSummary.reviews.length > 0 ? (
            roleSummary.reviews.map((review) => (
              <Pressable
                key={review.id}
                accessibilityRole="button"
                onPress={() => router.push(Routes.app.reviewDetail(review.id))}
                style={styles.reviewCard}>
                <Card>
                  <ReviewSummaryCard
                    review={review}
                    revieweeIsProfessional={isProfessionalReview(review)}
                    showNavigateHint
                  />
                </Card>
              </Pressable>
            ))
          ) : (
            <EmptyState
              title={
                primaryRole === 'professional'
                  ? 'Sin reseñas como profesional'
                  : 'Sin reseñas como cliente'
              }
            />
          )}
        </Section>
      ) : null}

      {activeTab === 'jobs' ? (
        <Section title="Trabajos">
          {jobHistoryQuery.isLoading || portfolioQuery.isLoading || ratedJobsQuery.isLoading ? (
            <AppText color="textSecondary" variant="body">
              Cargando historial...
            </AppText>
          ) : (
            <>
              {(portfolioQuery.data?.length ?? 0) > 0 ? (
                <>
                  <AppText variant="bodyMedium">Portfolio</AppText>
                  <Spacer size="sm" />
                  {portfolioQuery.data?.map((item) => (
                    <Pressable
                      key={item.reviewId}
                      accessibilityRole="button"
                      onPress={() => router.push(Routes.app.reviewDetail(item.reviewId))}
                      style={styles.jobCard}>
                      <Card>
                        <WorkShowcaseCard
                          evidenceUrls={item.evidenceUrls}
                          rating={item.rating}
                          subtitle={item.comment ?? undefined}
                          title={item.title}
                        />
                      </Card>
                    </Pressable>
                  ))}
                  <Spacer size="lg" />
                </>
              ) : null}

              {(ratedJobsQuery.data?.length ?? 0) > 0 ? (
                <>
                  <AppText variant="bodyMedium">Trabajos valorados</AppText>
                  <Spacer size="sm" />
                  {ratedJobsQuery.data?.map((item) => (
                    <Pressable
                      key={item.reviewId}
                      accessibilityRole="button"
                      onPress={() => router.push(Routes.app.reviewDetail(item.reviewId))}
                      style={styles.jobCard}>
                      <Card>
                        <WorkShowcaseCard
                          evidenceUrls={item.ownEvidenceUrls}
                          rating={item.rating}
                          subtitle={`Valorado por ${item.reviewerName}`}
                          title={item.title}
                        />
                      </Card>
                    </Pressable>
                  ))}
                  <Spacer size="lg" />
                </>
              ) : null}

              {profile.isProfessional ? (
                <>
                  <AppText variant="bodyMedium">Como profesional</AppText>
                  <Spacer size="sm" />
                  {professionalJobs.length > 0 ? (
                    professionalJobs.map((job) => (
                      <View key={job.id} style={styles.jobCard}>
                        <Card>
                          <AppText variant="bodyMedium">{job.title}</AppText>
                          <AppText color="textSecondary" variant="caption">
                            {job.categoryName} · {job.subcategoryName}
                          </AppText>
                        </Card>
                      </View>
                    ))
                  ) : (
                    <EmptyState title="Sin trabajos realizados" />
                  )}
                </>
              ) : null}

              {profile.isClient ? (
                <>
                  <Spacer size="lg" />
                  <AppText variant="bodyMedium">Como cliente</AppText>
                  <Spacer size="sm" />
                  {clientJobs.length > 0 ? (
                    clientJobs.map((job) => (
                      <View key={job.id} style={styles.jobCard}>
                        <Card>
                          <AppText variant="bodyMedium">{job.title}</AppText>
                          <AppText color="textSecondary" variant="caption">
                            {job.categoryName} · {job.subcategoryName}
                          </AppText>
                        </Card>
                      </View>
                    ))
                  ) : (
                    <EmptyState title="Sin solicitudes completadas" />
                  )}
                </>
              ) : null}
            </>
          )}
        </Section>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    alignSelf: 'flex-start',
  },
  summaryTraitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  reviewCard: {
    marginBottom: Spacing.md,
  },
  jobCard: {
    marginBottom: Spacing.md,
  },
});
