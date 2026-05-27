import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StackHeader } from '@/components/layout/stack-header';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
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
import { useProfileReviews, useRatedJobs, useReviewPortfolio } from '@/features/reviews/hooks/use-reviews';

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
  const { userId, view } = useLocalSearchParams<PublicProfileParams>();
  const [activeTab, setActiveTab] = useState<PublicProfileTab>('summary');
  const profileQuery = useProfile(userId);
  const reviewsQuery = useProfileReviews(userId);
  const portfolioQuery = useReviewPortfolio(userId);
  const ratedJobsQuery = useRatedJobs(userId);
  const jobHistoryQuery = useUserJobHistory(userId);
  const categoriesQuery = useServiceCategories();

  const profile = profileQuery.data;
  const primaryRole = profile
    ? resolvePrimaryRole(view, profile.isClient, profile.isProfessional)
    : 'client';

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
        <Avatar imageUrl={profile.avatarUrl} name={profile.fullName} size={72} />
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
        {reviewsQuery.data && reviewsQuery.data.totalReviews > 0 ? (
          <>
            <Spacer size="sm" />
            <AppText color="textSecondary" variant="caption">
              {reviewsQuery.data.averageRating.toFixed(1)}★ · {reviewsQuery.data.totalReviews}{' '}
              reseñas
            </AppText>
          </>
        ) : null}
      </Card>

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

          {reviewsQuery.data && reviewsQuery.data.totalReviews > 0 ? (
            <>
              <Spacer size="md" />
              <Card>
                <AppText variant="bodyMedium">Valoración destacada</AppText>
                <Spacer size="sm" />
                {traitDefinitions.map((definition) => {
                  const value = reviewsQuery.data?.traitAverages[definition.key];
                  if (!value) {
                    return null;
                  }

                  return (
                    <AppText key={definition.key} color="textSecondary" variant="caption">
                      {definition.label}: {value.toFixed(1)}★
                    </AppText>
                  );
                })}
              </Card>
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
          ) : reviewsQuery.data && reviewsQuery.data.reviews.length > 0 ? (
            reviewsQuery.data.reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <Card>
                  <ReviewSummaryCard
                    review={review}
                    revieweeIsProfessional={isProfessionalReview(review)}
                  />
                </Card>
              </View>
            ))
          ) : (
            <EmptyState title="Sin reseñas" />
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
                    <View key={item.reviewId} style={styles.jobCard}>
                      <Card>
                        <WorkShowcaseCard
                          evidenceUrls={item.evidenceUrls}
                          rating={item.rating}
                          subtitle={item.comment ?? undefined}
                          title={item.title}
                        />
                      </Card>
                    </View>
                  ))}
                  <Spacer size="lg" />
                </>
              ) : null}

              {(ratedJobsQuery.data?.length ?? 0) > 0 ? (
                <>
                  <AppText variant="bodyMedium">Trabajos valorados</AppText>
                  <Spacer size="sm" />
                  {ratedJobsQuery.data?.map((item) => (
                    <View key={item.reviewId} style={styles.jobCard}>
                      <Card>
                        <WorkShowcaseCard
                          evidenceUrls={item.ownEvidenceUrls}
                          rating={item.rating}
                          subtitle={`Valorado por ${item.reviewerName}`}
                          title={item.title}
                        />
                      </Card>
                    </View>
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
  reviewCard: {
    marginBottom: Spacing.md,
  },
  jobCard: {
    marginBottom: Spacing.md,
  },
});
