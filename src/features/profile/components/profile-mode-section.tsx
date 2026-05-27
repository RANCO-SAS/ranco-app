import { useRouter } from 'expo-router';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { StyleSheet, View } from 'react-native';
import { ModeSwitcher } from '@/features/profile/components/mode-switcher';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';

export function ProfileModeSection() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const { activeMode, canSwitchMode, switchMode } = useActiveMode();

  if (!profile) {
    return null;
  }

  const needsProfessionalSetup =
    !profile.isProfessional || profile.professionalSubcategoryIds.length === 0;

  return (
    <Card>
      <AppText variant="subtitle">Modo</AppText>

      <Spacer size="md" />

      {canSwitchMode ? (
        <ModeSwitcher activeMode={activeMode} onChange={switchMode} />
      ) : (
        <>
          <AppText variant="bodyMedium">
            {activeMode === 'client' ? 'Cliente' : 'Profesional'}
          </AppText>

          {needsProfessionalSetup ? (
            <>
              <Spacer size="md" />
              <Button
                label="Configurar servicios"
                onPress={() => router.push(Routes.app.activateProfessional)}
                variant="dark"
              />
            </>
          ) : null}
        </>
      )}

      {profile.isProfessional && needsProfessionalSetup && canSwitchMode ? (
        <>
          <Spacer size="md" />
          <Button
            label="Configurar servicios"
            onPress={() => router.push(Routes.app.activateProfessional)}
            variant="secondary"
          />
        </>
      ) : null}
    </Card>
  );
}
