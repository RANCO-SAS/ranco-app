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
import { ProfileModeSection } from '@/features/profile/components/profile-mode-section';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
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
  const { activeMode } = useActiveMode();

  const activeModeLabel = activeMode === 'client' ? 'Cliente' : 'Profesional';

  return (
    <ScreenLayout scrollable>
      <Section
        title="Perfil"
        description="Tu cuenta, modo de uso y preferencias.">
        {profile ? (
          <Card>
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
            <Spacer size="sm" />
            <AppText color="textMuted" variant="caption">
              Roles: {formatRoles(profile.isClient, profile.isProfessional)}
            </AppText>
            <AppText color="primary" variant="caption">
              Usando ahora: {activeModeLabel}
            </AppText>
          </Card>
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
