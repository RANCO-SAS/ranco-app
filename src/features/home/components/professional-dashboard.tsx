import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { IosActionCard } from '@/components/ui/ios-action-card';
import { StaggeredFadeIn } from '@/components/ui/staggered-fade-in';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { DashboardStatCard } from '@/features/home/components/dashboard-stat-card';
import { GradientPromoCard } from '@/features/home/components/gradient-promo-card';
import { RecentActivitySection } from '@/features/home/components/recent-activity-section';
import { buildRecentActivity } from '@/features/home/utils/build-recent-activity';
import type { DashboardStat } from '@/features/home/types/dashboard.types';
import { usePublishedServiceRequests } from '@/features/jobs/hooks/use-service-requests';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';
import { useUserJobHistory } from '@/features/profile/hooks/use-user-job-history';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useProfileReviews, selectRoleReviewSummary } from '@/features/reviews/hooks/use-reviews';
import { useTheme } from '@/hooks/use-theme';

export function ProfessionalDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useCurrentProfile();
  const reviewsQuery = useProfileReviews(profile?.id);
  const jobHistoryQuery = useUserJobHistory(profile?.id);
  const notificationsQuery = useNotifications(profile?.id);
  const publishedRequests = usePublishedServiceRequests(Boolean(profile?.isProfessional));

  const professionalAreas = profile?.professionalSubcategoryIds ?? [];
  const roleSummary = selectRoleReviewSummary(reviewsQuery.data, 'professional');
  const professionalJobs = (jobHistoryQuery.data ?? []).filter((job) => job.role === 'professional');

  const opportunitiesCount = useMemo(() => {
    if (!profile) {
      return 0;
    }

    return (publishedRequests.data ?? []).filter(
      (request) =>
        request.clientId !== profile.id &&
        professionalAreas.includes(request.subcategoryId),
    ).length;
  }, [profile, professionalAreas, publishedRequests.data]);

  const stats = useMemo((): DashboardStat[] => {
    const ratingValue =
      roleSummary && roleSummary.totalReviews > 0
        ? roleSummary.averageRating.toFixed(1)
        : '—';

    return [
      {
        key: 'rating',
        label: 'CALIFICACIÓN',
        value: ratingValue,
        trailingIcon: 'star',
        trailingIconColor: theme.warning,
      },
      {
        key: 'jobs',
        label: 'TRABAJOS',
        value: String(professionalJobs.length),
      },
      {
        key: 'reviews',
        label: 'RESEÑAS',
        value: String(roleSummary?.totalReviews ?? 0),
      },
      {
        key: 'opportunities',
        label: 'OPORTUNIDADES',
        value: String(opportunitiesCount),
      },
    ];
  }, [opportunitiesCount, professionalJobs.length, roleSummary, theme.warning]);

  const recentActivity = useMemo(
    () => buildRecentActivity(notificationsQuery.data ?? [], theme),
    [notificationsQuery.data, theme],
  );

  const isActivityLoading = notificationsQuery.isLoading;

  return (
    <View style={styles.dashboard}>
      <StaggeredFadeIn index={1}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <DashboardStatCard
                key={stat.key}
                label={stat.label}
                trailingIcon={stat.trailingIcon}
                trailingIconColor={stat.trailingIconColor}
                value={stat.value}
              />
            ))}
          </View>
        </ScrollView>
      </StaggeredFadeIn>

      <Spacer size="md" />

      <StaggeredFadeIn index={2}>
        <GradientPromoCard
          actionLabel="Explorar oportunidades"
          description="Descubre trabajos cerca de ti y aumenta tu visibilidad en Ranco."
          onPress={() => router.push(Routes.app.discover)}
          title="Consejos para profesionales"
        />
      </StaggeredFadeIn>

      <Spacer size="lg" />

      <View style={styles.gridRow}>
        <StaggeredFadeIn index={3} style={styles.gridItem}>
          <IosActionCard
            featured
            icon={<AppIcon color={theme.primary} name="briefcase-outline" size={28} />}
            onPress={() => router.push(Routes.app.discover)}
            subtitle="Ver trabajos disponibles"
            title="Oportunidades"
          />
        </StaggeredFadeIn>
        <StaggeredFadeIn index={4} style={styles.gridItem}>
          <IosActionCard
            featured
            icon={<AppIcon color={theme.primary} name="construct-outline" size={28} />}
            onPress={() => router.push(Routes.app.activateProfessional)}
            subtitle="Administrar mis habilidades"
            title="Mis servicios"
          />
        </StaggeredFadeIn>
      </View>

      <View style={styles.gridRow}>
        <StaggeredFadeIn index={5} style={styles.gridItem}>
          <IosActionCard
            compact
            icon={<AppIcon color={theme.textMuted} name="person-outline" size={22} />}
            onPress={() => router.push(Routes.app.profile)}
            title="Mi perfil"
          />
        </StaggeredFadeIn>
        <StaggeredFadeIn index={6} style={styles.gridItem}>
          <IosActionCard
            compact
            icon={<AppIcon color={theme.textMuted} name="settings-outline" size={22} />}
            onPress={() => router.push(Routes.app.editProfile)}
            title="Configuración"
          />
        </StaggeredFadeIn>
      </View>

      <Spacer size="xl" />

      <StaggeredFadeIn index={7}>
        <RecentActivitySection isLoading={isActivityLoading} items={recentActivity} />
      </StaggeredFadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboard: {
    gap: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'stretch',
  },
  gridItem: {
    flex: 1,
    minWidth: 0,
  },
});
