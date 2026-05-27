import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImagePreviewModal } from '@/components/ui/image-preview-modal';
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
import { useProfileReviews, selectRoleReviewSummary } from '@/features/reviews/hooks/use-reviews';

export function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const logout = useLogout();
  const [isAvatarPreviewVisible, setIsAvatarPreviewVisible] = useState(false);
  const reviewsQuery = useProfileReviews(profile?.id);
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
      <Section title="Perfil">
        {profile ? (
          <>
            <Card>
              <View style={styles.profileRow}>
                {profile.avatarUrl ? (
                  <Pressable
                    accessibilityLabel="Ver foto de perfil"
                    accessibilityRole="button"
                    onPress={() => setIsAvatarPreviewVisible(true)}>
                    <Avatar imageUrl={profile.avatarUrl} name={profile.fullName} size={72} />
                  </Pressable>
                ) : (
                  <Avatar imageUrl={profile.avatarUrl} name={profile.fullName} size={72} />
                )}

                <Pressable
                  accessibilityRole="button"
                  onPress={handleOpenPublicProfile}
                  style={styles.profileMeta}>
                  <AppText variant="subtitle">{profile.fullName || 'Usuario'}</AppText>
                  {session?.email ? (
                    <AppText color="textSecondary" numberOfLines={1} variant="caption">
                      {session.email}
                    </AppText>
                  ) : null}
                  {roleSummary && roleSummary.totalReviews > 0 ? (
                    <AppText color="textSecondary" variant="caption">
                      {roleSummary.averageRating.toFixed(1)}★ · {roleSummary.totalReviews} reseñas{' '}
                      {roleLabel}
                    </AppText>
                  ) : null}
                  <AppText color="primary" variant="small">
                    Ver resumen público
                  </AppText>
                </Pressable>

                <Pressable accessibilityRole="button" onPress={handleOpenPublicProfile}>
                  <AppText color="textMuted" variant="subtitle">
                    ›
                  </AppText>
                </Pressable>
              </View>
            </Card>

            {profile.avatarUrl ? (
              <ImagePreviewModal
                imageUrl={profile.avatarUrl}
                onClose={() => setIsAvatarPreviewVisible(false)}
                title={profile.fullName || 'Foto de perfil'}
                visible={isAvatarPreviewVisible}
              />
            ) : null}
          </>
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
