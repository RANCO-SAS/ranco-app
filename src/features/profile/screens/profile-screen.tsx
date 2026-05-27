import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

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
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useProfileReviews } from '@/features/reviews/hooks/use-reviews';

export function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { profile } = useCurrentProfile();
  const logout = useLogout();
  const reviewsQuery = useProfileReviews(profile?.id);

  return (
    <ScreenLayout safeArea="tab" scrollable>
      <Section title="Perfil">
        {profile ? (
          <Card>
            <Avatar imageUrl={profile.avatarUrl} name={profile.fullName} size={72} />
            <Spacer size="md" />
            <AppText variant="subtitle">{profile.fullName || 'Usuario'}</AppText>
            <Spacer size="sm" />
            {session?.email ? (
              <AppText color="textSecondary" variant="body">
                {session.email}
              </AppText>
            ) : null}
            {profile.phone ? (
              <>
                <Spacer size="sm" />
                <AppText color="textSecondary" variant="body">
                  {profile.phone}
                </AppText>
              </>
            ) : null}
            {profile.locationLabel ? (
              <>
                <Spacer size="sm" />
                <AppText color="textSecondary" variant="body">
                  {profile.locationLabel}
                </AppText>
              </>
            ) : null}
            {reviewsQuery.data && reviewsQuery.data.totalReviews > 0 ? (
              <>
                <Spacer size="sm" />
                <AppText color="textSecondary" variant="caption">
                  {reviewsQuery.data.averageRating.toFixed(1)}★ ·{' '}
                  {reviewsQuery.data.totalReviews} reseñas
                </AppText>
              </>
            ) : null}
          </Card>
        ) : null}

        {reviewsQuery.data && reviewsQuery.data.reviews.length > 0 ? (
          <>
            <Spacer size="lg" />
            <Card>
              <AppText variant="bodyMedium">Reseñas recibidas</AppText>
              <Spacer size="md" />
              {reviewsQuery.data.reviews.slice(0, 5).map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <AppText variant="bodyMedium">{review.rating}★ · {review.reviewerName}</AppText>
                  {review.comment ? (
                    <AppText color="textSecondary" variant="caption">
                      {review.comment}
                    </AppText>
                  ) : null}
                </View>
              ))}
            </Card>
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
  reviewItem: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
});
