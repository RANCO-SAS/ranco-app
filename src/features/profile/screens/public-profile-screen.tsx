import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { AppIcon } from '@/components/ui/app-icon';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';
import { Spacer } from '@/components/ui/spacer';
import { StaggeredFadeIn } from '@/components/ui/staggered-fade-in';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { PublicProfileHero } from '@/features/profile/components/public-profile-hero';
import { PublicProfileStatCard } from '@/features/profile/components/public-profile-stat-card';
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
import {
  useProfileReviews,
  useRatedJobs,
  useReviewPortfolio,
  selectRoleReviewSummary,
} from '@/features/reviews/hooks/use-reviews';
import { useProfileReviewsRealtime } from '@/features/reviews/hooks/use-profile-reviews-realtime';
import { useScreenSurfaceColor } from '@/hooks/use-screen-surface-color';
import { useTheme } from '@/hooks/use-theme';

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

function resolveProfessionLabel(services: string[]): string | undefined {
  if (services.length === 0) {
    return undefined;
  }

  return services[0];
}

export function PublicProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { userId, view } = useLocalSearchParams<PublicProfileParams>();
  const [activeTab, setActiveTab] = useState<PublicProfileTab>('summary');
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
  const roleSummary = selectRoleReviewSummary(reviewsQuery.data, primaryRole) ?? null;
  const screenTitle =
    primaryRole === 'professional' ? 'Perfil Profesional' : 'Perfil de Cliente';

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

  const completedJobsCount =
    primaryRole === 'professional' ? professionalJobs.length : clientJobs.length;
  const completedJobsSuffix =
    primaryRole === 'professional' ? 'proyectos exitosos' : 'solicitudes completadas';

  const traitDefinitions =
    primaryRole === 'professional' ? PROFESSIONAL_REVIEW_TRAITS : CLIENT_REVIEW_TRAITS;
  const hasProfile = Boolean(profile) && !profileQuery.isLoading && !profileQuery.error;

  useScreenSurfaceColor(hasProfile ? theme.backgroundSecondary : theme.background);

  if (profileQuery.isLoading) {
    return <ScreenLayout loading loadingMessage="Cargando perfil..." />;
  }

  if (profileQuery.error || !profile) {
    return (
      <ScreenLayout flush scrollable={false}>
        <View style={styles.emptyStateWrap}>
          <EmptyState title="Perfil no disponible" />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout flush scrollable={false}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <PublicProfileHero
        activeTab={activeTab}
        avatarUrl={profile.avatarUrl}
        fullName={profile.fullName}
        locationLabel={profile.locationLabel}
        onTabChange={setActiveTab}
        primaryRole={primaryRole}
        professionLabel={resolveProfessionLabel(professionalServices)}
        roleSummary={roleSummary}
        title={screenTitle}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={[styles.scroll, { backgroundColor: theme.background }]}>
        <View style={styles.tabContent}>
          {activeTab === 'summary' ? (
            <StaggeredFadeIn index={0}>
              <View style={styles.summaryContent}>
                <View style={styles.statsRow}>
                  <PublicProfileStatCard
                    label={
                      primaryRole === 'professional'
                        ? 'TRABAJOS COMPLETADOS'
                        : 'SOLICITUDES COMPLETADAS'
                    }
                    suffix={completedJobsSuffix}
                    value={String(completedJobsCount)}
                  />
                  <PublicProfileStatCard
                    label="PUNTUACIÓN MEDIA"
                    suffix={
                      roleSummary && roleSummary.totalReviews > 0
                        ? `/ 5 (${roleSummary.totalReviews} reseñas)`
                        : 'Sin reseñas aún'
                    }
                    trailing={
                      roleSummary && roleSummary.totalReviews > 0 ? (
                        <AppIcon color={theme.warning} name="star" size={22} />
                      ) : null
                    }
                    value={
                      roleSummary && roleSummary.totalReviews > 0
                        ? roleSummary.averageRating.toFixed(1)
                        : '—'
                    }
                  />
                </View>

                {primaryRole === 'professional' && professionalServices.length > 0 ? (
                  <Card>
                    <View style={styles.sectionHeader}>
                      <AppIcon color={theme.primary} name="construct-outline" size={18} />
                      <AppText color="primary" variant="bodyMedium">
                        Servicios ofrecidos
                      </AppText>
                    </View>

                    <Spacer size="md" />

                    <View style={styles.servicesList}>
                      {professionalServices.map((service) => (
                        <View key={service} style={styles.serviceRow}>
                          <AppIcon color={theme.primary} name="checkmark-circle" size={18} />
                          <AppText style={styles.serviceText} variant="body">
                            {service}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </Card>
                ) : null}

                {primaryRole === 'client' ? (
                  <Card>
                    <View style={styles.sectionHeader}>
                      <AppIcon color={theme.primary} name="person-outline" size={18} />
                      <AppText color="primary" variant="bodyMedium">
                        Actividad como cliente
                      </AppText>
                    </View>
                    <Spacer size="md" />
                    <AppText color="textSecondary" variant="body">
                      Ha completado {clientJobs.length} solicitudes de servicio en la plataforma.
                    </AppText>
                  </Card>
                ) : null}

                {roleSummary && roleSummary.totalReviews > 0 ? (
                  <>
                    <Card>
                      <View style={styles.sectionHeader}>
                        <AppIcon color={theme.primary} name="star-outline" size={18} />
                        <AppText color="primary" variant="bodyMedium">
                          Valoración destacada
                        </AppText>
                      </View>

                      <Spacer size="md" />

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
                            <View style={styles.traitValue}>
                              <AppText variant="bodyMedium">{value.toFixed(1)}</AppText>
                              <AppIcon color={theme.warning} name="star" size={14} />
                            </View>
                          </View>
                        );
                      })}
                    </Card>

                    <View style={styles.sectionHeading}>
                      <AppText variant="bodyMedium">Reseñas recientes</AppText>
                    </View>

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
              </View>
            </StaggeredFadeIn>
          ) : null}

          {activeTab === 'reviews' ? (
            <StaggeredFadeIn index={0}>
              {reviewsQuery.isLoading ? (
                <Loader message="Cargando reseñas..." size="small" variant="inline" />
              ) : roleSummary && roleSummary.reviews.length > 0 ? (
                <View style={styles.listContent}>
                  {roleSummary.reviews.map((review) => (
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
                </View>
              ) : (
                <EmptyState
                  title={
                    primaryRole === 'professional'
                      ? 'Sin reseñas como profesional'
                      : 'Sin reseñas como cliente'
                  }
                />
              )}
            </StaggeredFadeIn>
          ) : null}

          {activeTab === 'jobs' ? (
            <StaggeredFadeIn index={0}>
              {jobHistoryQuery.isLoading || portfolioQuery.isLoading || ratedJobsQuery.isLoading ? (
                <Loader message="Cargando historial..." size="small" variant="inline" />
              ) : (
                <View style={styles.listContent}>
                  {(portfolioQuery.data?.length ?? 0) > 0 ? (
                    <>
                      <View style={styles.sectionHeading}>
                        <AppIcon color={theme.primary} name="images-outline" size={18} />
                        <AppText variant="bodyMedium">Portfolio</AppText>
                      </View>
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
                    </>
                  ) : null}

                  {(ratedJobsQuery.data?.length ?? 0) > 0 ? (
                    <>
                      <View style={styles.sectionHeading}>
                        <AppIcon color={theme.primary} name="ribbon-outline" size={18} />
                        <AppText variant="bodyMedium">Trabajos valorados</AppText>
                      </View>
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
                    </>
                  ) : null}

                  {profile.isProfessional ? (
                    <>
                      <View style={styles.sectionHeading}>
                        <AppIcon color={theme.primary} name="briefcase-outline" size={18} />
                        <AppText variant="bodyMedium">Como profesional</AppText>
                      </View>
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
                      <View style={styles.sectionHeading}>
                        <AppIcon color={theme.primary} name="person-outline" size={18} />
                        <AppText variant="bodyMedium">Como cliente</AppText>
                      </View>
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
                </View>
              )}
            </StaggeredFadeIn>
          ) : null}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxxl,
  },
  emptyStateWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingHorizontal,
  },
  tabContent: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  summaryContent: {
    gap: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  servicesList: {
    gap: Spacing.md,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  serviceText: {
    flex: 1,
  },
  summaryTraitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  traitValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  listContent: {
    gap: Spacing.lg,
  },
  reviewCard: {
    marginBottom: Spacing.sm,
  },
  jobCard: {
    marginBottom: Spacing.sm,
  },
});
