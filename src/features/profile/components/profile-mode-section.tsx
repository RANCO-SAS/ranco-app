import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';
import { ModeSwitcher } from '@/features/profile/components/mode-switcher';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import type { UserMode } from '@/types';

const MODE_SUMMARY: Record<UserMode, { title: string; description: string }> = {
  client: {
    title: 'Modo cliente activo',
    description: 'Publicas solicitudes, ves tus trabajos y contactas profesionales.',
  },
  professional: {
    title: 'Modo profesional activo',
    description: 'Exploras oportunidades de tu oficio y contactas clientes.',
  },
};

export function ProfileModeSection() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const { activeMode, canSwitchMode, switchMode } = useActiveMode();

  if (!profile) {
    return null;
  }

  const summary = MODE_SUMMARY[activeMode];
  const hasProfessionalProfile =
    profile.isProfessional && profile.professionalSubcategoryIds.length > 0;
  const needsProfessionalSetup =
    !profile.isProfessional || profile.professionalSubcategoryIds.length === 0;
  const canActivateClient = profile.isProfessional && !profile.isClient;

  return (
    <Card>
      <AppText variant="subtitle">Modo de la app</AppText>
      <Spacer size="xs" />
      <AppText color="textSecondary" variant="caption">
        Cambia cómo navegas la app. Los roles definen qué puedes hacer; el modo define qué ves ahora.
      </AppText>

      <Spacer size="md" />

      {canSwitchMode ? (
        <>
          <ModeSwitcher activeMode={activeMode} onChange={switchMode} />
          <Spacer size="md" />
          <View style={styles.summary}>
            <AppText color="primary" variant="caption">
              {summary.title}
            </AppText>
            <AppText color="textSecondary" variant="caption">
              {summary.description}
            </AppText>
          </View>
        </>
      ) : (
        <View style={styles.summary}>
          <AppText variant="bodyMedium">{summary.title}</AppText>
          <AppText color="textSecondary" variant="caption">
            {summary.description}
          </AppText>

          <Spacer size="md" />

          {needsProfessionalSetup ? (
            <>
              <AppText color="textSecondary" variant="caption">
                Configura tu perfil profesional con entre 1 y 3 servicios para ofrecer y ver
                oportunidades de tu oficio.
              </AppText>
              <Spacer size="sm" />
              <Button
                label="Configurar perfil profesional"
                onPress={() => router.push(Routes.app.activateProfessional)}
                variant="dark"
              />
            </>
          ) : null}

          {canActivateClient ? (
            <>
              <AppText color="textSecondary" variant="caption">
                Ahora solo ofreces servicios. Activa también el rol cliente para publicar
                solicitudes desde Editar perfil.
              </AppText>
            </>
          ) : null}
        </View>
      )}

      {profile.isProfessional && !hasProfessionalProfile ? (
        <>
          <Spacer size="md" />
          <View style={styles.warningBox}>
            <AppText color="warning" variant="caption">
              Perfil profesional incompleto
            </AppText>
            <AppText color="textSecondary" variant="caption">
              Elige al menos un servicio para empezar a ver ofertas relevantes.
            </AppText>
            <Spacer size="sm" />
            <Button
              label="Completar perfil profesional"
              onPress={() => router.push(Routes.app.activateProfessional)}
              variant="secondary"
            />
          </View>
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: Spacing.xs,
  },
  warningBox: {
    gap: Spacing.xs,
  },
});
