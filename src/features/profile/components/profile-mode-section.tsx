import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { Radius, Spacing } from '@/constants/theme';
import { ModeSwitcher } from '@/features/profile/components/mode-switcher';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useTheme } from '@/hooks/use-theme';
import type { UserMode } from '@/types';

function getActiveModeDescription(mode: UserMode, isHybrid: boolean): string {
  if (isHybrid) {
    return mode === 'client'
      ? 'Estás viendo solicitudes, mensajes y accesos de cliente.'
      : 'Estás viendo oportunidades, servicios y herramientas de profesional.';
  }

  return mode === 'client'
    ? 'Tu cuenta está configurada como cliente.'
    : 'Tu cuenta está configurada como profesional.';
}

export function ProfileModeSection() {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useCurrentProfile();
  const { activeMode, canSwitchMode, isHybridUser, switchMode } = useActiveMode();

  if (!profile) {
    return null;
  }

  const needsProfessionalSetup =
    !profile.isProfessional || profile.professionalSubcategoryIds.length === 0;
  const modeIcon = activeMode === 'professional' ? 'shield-checkmark-outline' : 'home-outline';
  const modeTitle = activeMode === 'professional' ? 'Modo profesional' : 'Modo cliente';

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: theme.backgroundElement }]}>
          <AppIcon color={theme.primary} name={modeIcon} size={22} />
        </View>

        <View style={styles.headerText}>
          <AppText variant="bodyMedium">{modeTitle}</AppText>
          <AppText color="textSecondary" variant="caption">
            {getActiveModeDescription(activeMode, isHybridUser)}
          </AppText>
        </View>
      </View>

      <Spacer size="md" />

      {canSwitchMode ? (
        <ModeSwitcher activeMode={activeMode} onChange={switchMode} />
      ) : (
        <View style={styles.rolesRow}>
          {profile.isClient ? (
            <View style={[styles.roleChip, { backgroundColor: theme.backgroundElement }]}>
              <AppText variant="small">Cliente</AppText>
            </View>
          ) : null}
          {profile.isProfessional ? (
            <View style={[styles.roleChip, { backgroundColor: theme.backgroundElement }]}>
              <AppText variant="small">Profesional</AppText>
            </View>
          ) : null}
        </View>
      )}

      {needsProfessionalSetup ? (
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

const styles = StyleSheet.create({
  card: {
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  roleChip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
