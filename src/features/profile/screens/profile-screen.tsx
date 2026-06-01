import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { AppIcon } from '@/components/ui/app-icon';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spacer } from '@/components/ui/spacer';
import { StaggeredFadeIn, fadeInDownEntrance } from '@/components/ui/staggered-fade-in';
import Animated from 'react-native-reanimated';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { ProfileModeSection } from '@/features/profile/components/profile-mode-section';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useProfileReviews, selectRoleReviewSummary } from '@/features/reviews/hooks/use-reviews';
import { useProfileReviewsRealtime } from '@/features/reviews/hooks/use-profile-reviews-realtime';
import { useTheme } from '@/hooks/use-theme';

export function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { session } = useAuth();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const logout = useLogout();
  const reviewsQuery = useProfileReviews(profile?.id);
  useProfileReviewsRealtime({
    enabled: Boolean(profile?.id),
    userId: profile?.id,
  });
  const activeRole = activeMode === 'professional' ? 'professional' : 'client';
  const roleSummary = selectRoleReviewSummary(reviewsQuery.data, activeRole);
  const roleLabel = activeRole === 'professional' ? 'como profesional' : 'como cliente';

  const handleOpenPublicProfile = () => {
    if (!profile?.id) {
      return;
    }

    router.push(
      Routes.app.userProfile(
        profile.id,
        activeMode === 'professional' ? 'professional' : 'client',
      ),
    );
  };

  return (
    <ScreenLayout safeArea="tab" scrollable>
      <Animated.View entering={fadeInDownEntrance()}>
        <AppText variant="title">Perfil</AppText>
      </Animated.View>

      <Spacer size="xl" />

      {profile ? (
        <>
          <StaggeredFadeIn index={1}>
            <View style={styles.hero}>
              <Avatar
                imageUrl={profile.avatarUrl}
                name={profile.fullName}
                previewTitle={profile.fullName || 'Foto de perfil'}
                previewable={Boolean(profile.avatarUrl)}
                size={96}
              />

              <AppText align="center" variant="subtitle">
                {profile.fullName || 'Usuario'}
              </AppText>

              {session?.email ? (
                <AppText align="center" color="textSecondary" numberOfLines={1} variant="caption">
                  {session.email}
                </AppText>
              ) : null}

              {roleSummary && roleSummary.totalReviews > 0 ? (
                <AppText align="center" color="textSecondary" variant="caption">
                  {roleSummary.averageRating.toFixed(1)}★ · {roleSummary.totalReviews} reseñas{' '}
                  {roleLabel}
                </AppText>
              ) : null}

              <Pressable
                accessibilityRole="button"
                onPress={handleOpenPublicProfile}
                style={styles.publicLink}>
                <AppText color="primary" variant="bodyMedium">
                  Ver perfil público
                </AppText>
                <AppIcon color={theme.primary} name="open-outline" size={16} />
              </Pressable>
            </View>
          </StaggeredFadeIn>

          <Spacer size="xl" />

          <StaggeredFadeIn index={2}>
            <ProfileModeSection />
          </StaggeredFadeIn>

          <Spacer size="lg" />

          <StaggeredFadeIn index={3}>
            <Button
              label="Editar perfil"
              onPress={() => router.push(Routes.app.editProfile)}
            />
          </StaggeredFadeIn>

          <Spacer size="md" />

          {logout.error ? (
            <AuthMessage message={mapAuthError(logout.error)} variant="error" />
          ) : null}

          <StaggeredFadeIn index={4}>
            <Button
              disabled={logout.isPending}
              label={logout.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
              onPress={() => logout.mutate()}
              variant="secondary"
            />
          </StaggeredFadeIn>
        </>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  publicLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
});
