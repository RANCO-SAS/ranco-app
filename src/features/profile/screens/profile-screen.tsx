import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { ProfileModeSection } from '@/features/profile/components/profile-mode-section';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useProfileReviews } from '@/features/reviews/hooks/use-reviews';

export function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const logout = useLogout();
  const reviewsQuery = useProfileReviews(profile?.id);

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
      <Section title="Perfil">
        {profile ? (
          <Pressable accessibilityRole="button" onPress={handleOpenPublicProfile}>
            <Card>
              <View style={styles.profileRow}>
                <Avatar imageUrl={profile.avatarUrl} name={profile.fullName} size={72} />

                <View style={styles.profileMeta}>
                  <AppText variant="subtitle">{profile.fullName || 'Usuario'}</AppText>
                  {session?.email ? (
                    <AppText color="textSecondary" numberOfLines={1} variant="caption">
                      {session.email}
                    </AppText>
                  ) : null}
                  {reviewsQuery.data && reviewsQuery.data.totalReviews > 0 ? (
                    <AppText color="textSecondary" variant="caption">
                      {reviewsQuery.data.averageRating.toFixed(1)} ·{' '}
                      {reviewsQuery.data.totalReviews} reseñas
                    </AppText>
                  ) : null}
                  <AppText color="primary" variant="small">
                    Ver resumen público
                  </AppText>
                </View>

                <AppText color="textMuted" variant="subtitle">
                  ›
                </AppText>
              </View>
            </Card>
          </Pressable>
        ) : null}

        <Spacer size="lg" />

        <ProfileModeSection />

        <Spacer size="lg" />

        <Button
          label="Editar perfil"
          onPress={() => router.push(Routes.app.editProfile)}
          variant="secondary"
        />

        <Spacer size="md" />

        {logout.error ? (
          <AuthMessage message={mapAuthError(logout.error)} variant="error" />
        ) : null}

        <Button
          disabled={logout.isPending}
          label={logout.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
          onPress={() => logout.mutate()}
          variant="ghost"
        />
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  profileMeta: {
    flex: 1,
    gap: Spacing.xs,
  },
});
