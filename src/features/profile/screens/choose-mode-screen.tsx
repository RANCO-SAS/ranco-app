import { useRouter } from 'expo-router';

import { AuthLayout } from '@/components/layout/auth-layout';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { ModeSwitcher } from '@/features/profile/components/mode-switcher';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useAppStore } from '@/stores/app-store';
import type { UserMode } from '@/types';

export function ChooseModeScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const setActiveMode = useAppStore((state) => state.setActiveMode);
  const clearModeSelectionPrompt = useAppStore((state) => state.clearModeSelectionPrompt);
  const storedMode = useAppStore((state) => state.activeMode);

  const handleContinue = () => {
    setActiveMode(storedMode);
    clearModeSelectionPrompt();
    router.replace(Routes.app.home);
  };

  return (
    <ScreenLayout scrollable centered>
      <AuthLayout
        title="¿Cómo quieres empezar?"
        subtitle="Elige si quieres pedir servicios o recibir oportunidades en esta sesión.">
        <AppText color="textSecondary" variant="body">
          Hola{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}. Tienes rol de cliente
          y profesional. ¿Cómo quieres empezar hoy?
        </AppText>

        <Spacer size="lg" />

        <ModeSwitcher
          activeMode={storedMode}
          onChange={(mode: UserMode) => setActiveMode(mode)}
        />

        <Spacer size="lg" />

        <Button label="Continuar" onPress={handleContinue} variant="dark" />
      </AuthLayout>
    </ScreenLayout>
  );
}
