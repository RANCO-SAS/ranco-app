import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spacer } from '@/components/ui/spacer';
import { StaggeredFadeIn, fadeInDownEntrance } from '@/components/ui/staggered-fade-in';
import { Routes } from '@/constants/routes';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { ProfileIdentitySection } from '@/features/profile/components/profile-identity-section';
import { ProfileMenuList, type ProfileMenuItem } from '@/features/profile/components/profile-menu-list';
import { ProfileModeSection } from '@/features/profile/components/profile-mode-section';
import { ProfileStatCard } from '@/features/profile/components/profile-stat-card';
import { ProBadge } from '@/features/subscriptions/components/pro-badge';
import { useIsUserPro } from '@/features/subscriptions/hooks/use-is-user-pro';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useUserJobHistory } from '@/features/profile/hooks/use-user-job-history';
import { useProfileReviews, selectRoleReviewSummary } from '@/features/reviews/hooks/use-reviews';
import { useProfileReviewsRealtime } from '@/features/reviews/hooks/use-profile-reviews-realtime';
import { useTheme } from '@/hooks/use-theme';

export function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const activeRole = activeMode === 'professional' ? 'professional' : 'client';
  const proStatusQuery = useIsUserPro(profile?.id, activeRole, Boolean(profile));
  const isPro = proStatusQuery.data ?? false;
  const logout = useLogout();
  const jobHistoryQuery = useUserJobHistory(profile?.id);
  const reviewsQuery = useProfileReviews(profile?.id);

  useProfileReviewsRealtime({
    enabled: Boolean(profile?.id),
    userId: profile?.id,
  });

  const roleSummary = selectRoleReviewSummary(reviewsQuery.data, activeRole);
  const completedJobs = (jobHistoryQuery.data ?? []).filter((job) => job.role === activeRole);

  const memberYear = profile?.createdAt
    ? new Date(profile.createdAt).getFullYear().toString()
    : '—';

  const ratingValue =
    roleSummary && roleSummary.totalReviews > 0
      ? roleSummary.averageRating.toFixed(1)
      : '—';

  const jobsLabel = activeRole === 'professional' ? 'TRABAJOS' : 'SOLICITUDES';

  const menuItems = useMemo((): ProfileMenuItem[] => {
    if (!profile) {
      return [];
    }

    const items: ProfileMenuItem[] = [
      {
        key: 'public-profile',
        icon: 'eye-outline',
        label: 'Ver perfil público',
        onPress: () =>
          router.push(
            Routes.app.userProfile(
              profile.id,
              activeMode === 'professional' ? 'professional' : 'client',
            ),
          ),
      },
      {
        key: 'notifications',
        icon: 'notifications-outline',
        label: 'Notificaciones',
        onPress: () => router.push(Routes.app.notifications),
      },
      {
        key: 'payment-terms',
        icon: 'document-text-outline',
        label: 'Términos de pagos',
        onPress: () => router.push(Routes.app.paymentTerms),
      },
      {
        key: 'subscription-plans',
        icon: 'diamond-outline',
        label: 'Planes Pro',
        onPress: () => router.push(Routes.app.subscriptionPlans),
      },
    ];

    if (profile.isClient) {
      items.push({
        key: 'jobs',
        icon: 'document-text-outline',
        label: 'Mis solicitudes',
        onPress: () => router.push(Routes.app.jobs),
      });
    }

    if (profile.isProfessional) {
      items.push({
        key: 'discover',
        icon: 'briefcase-outline',
        label: 'Oportunidades',
        onPress: () => router.push(Routes.app.discover),
      });
      items.push({
        key: 'services',
        icon: 'construct-outline',
        label: 'Mis servicios',
        onPress: () => router.push(Routes.app.activateProfessional),
      });
    }

    return items;
  }, [activeMode, profile, router]);

  return (
    <ScreenLayout safeArea="tab" scrollable>
      <Animated.View entering={fadeInDownEntrance()}>
        <View style={styles.headerRow}>
          <AppText variant="title">Perfil</AppText>
          <Pressable
            accessibilityLabel="Editar perfil"
            accessibilityRole="button"
            hitSlop={Spacing.sm}
            onPress={() => router.push(Routes.app.editProfile)}
            style={styles.settingsButton}>
            <AppIcon color={theme.text} name="settings-outline" size={24} />
          </Pressable>
        </View>
      </Animated.View>

      <Spacer size="xl" />

      {profile ? (
        <>
          <StaggeredFadeIn index={1}>
            <ProfileIdentitySection
              avatarUrl={profile.avatarUrl}
              fullName={profile.fullName}
              isPro={isPro}
              locationLabel={profile.locationLabel}
              onEditPhotoPress={() => router.push(Routes.app.editProfile)}
              proVariant={activeRole}
            />
          </StaggeredFadeIn>

          <Spacer size="lg" />

          <StaggeredFadeIn index={2}>
            <View style={styles.statsRow}>
              <ProfileStatCard label={jobsLabel} value={String(completedJobs.length)} />
              <ProfileStatCard label="PUNTAJE" trailingIcon="star" value={ratingValue} />
              <ProfileStatCard label="MIEMBRO" value={memberYear} />
            </View>
          </StaggeredFadeIn>

          <Spacer size="xl" />

          <StaggeredFadeIn index={3}>
            <ProfileModeSection />
          </StaggeredFadeIn>

          <Spacer size="lg" />

          <StaggeredFadeIn index={4}>
            <ProfileMenuList items={menuItems} />
          </StaggeredFadeIn>

          <Spacer size="xl" />

          <StaggeredFadeIn index={5}>
            <Button label="Editar perfil" onPress={() => router.push(Routes.app.editProfile)} />
          </StaggeredFadeIn>

          <Spacer size="md" />

          {logout.error ? (
            <>
              <AuthMessage message={mapAuthError(logout.error)} variant="error" />
              <Spacer size="md" />
            </>
          ) : null}

          <StaggeredFadeIn index={6}>
            <AnimatedPressable
              accessibilityRole="button"
              disabled={logout.isPending}
              onPress={() => logout.mutate()}
              style={[
                styles.logoutButton,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  opacity: logout.isPending ? 0.5 : 1,
                },
              ]}>
              <AppText align="center" color="destructive" variant="bodyMedium">
                {logout.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </AppText>
            </AnimatedPressable>
          </StaggeredFadeIn>
        </>
      ) : null}

      <Spacer size="lg" />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  logoutButton: {
    minHeight: Layout.minTouchTarget + 4,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
});
