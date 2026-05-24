import { useRouter } from 'expo-router';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';

function formatRoles(isClient: boolean, isProfessional: boolean): string {
  if (isClient && isProfessional) {
    return 'Cliente y profesional';
  }

  if (isProfessional) {
    return 'Profesional';
  }

  return 'Cliente';
}

export function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { profile } = useCurrentProfile();
  const logout = useLogout();

  return (
    <ScreenLayout scrollable>
      <Section
        title="Perfil"
        description="Tu información, reputación y preferencias de cuenta.">
        {profile ? (
          <Card>
            <AppText variant="subtitle">{profile.fullName || 'Usuario'}</AppText>
            <Spacer size="sm" />
            {session?.email ? (
              <AppText variant="body" color="textSecondary">
                {session.email}
              </AppText>
            ) : null}
            {profile.phone ? (
              <>
                <Spacer size="sm" />
                <AppText variant="body" color="textSecondary">
                  {profile.phone}
                </AppText>
              </>
            ) : null}
            {profile.locationLabel ? (
              <>
                <Spacer size="sm" />
                <AppText variant="body" color="textSecondary">
                  {profile.locationLabel}
                </AppText>
              </>
            ) : null}
            <Spacer size="sm" />
            <AppText variant="caption" color="textMuted">
              {formatRoles(profile.isClient, profile.isProfessional)}
            </AppText>
          </Card>
        ) : null}

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
