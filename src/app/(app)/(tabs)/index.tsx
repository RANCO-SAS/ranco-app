import { useRouter } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { StaggeredFadeIn } from '@/components/ui/staggered-fade-in';
import { AppText } from '@/components/ui/text';
import { ClientDashboard } from '@/features/home/components/client-dashboard';
import { ProfessionalDashboard } from '@/features/home/components/professional-dashboard';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { formatPersonalGreeting } from '@/shared/utils/format-greeting';

const rancoBrandIcon = require('@/assets/images/ranco-icon.png');

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();

  const isClientHome = activeMode === 'client';
  const hasProfessionalServices = (profile?.professionalSubcategoryIds.length ?? 0) > 0;
  const personalGreeting = formatPersonalGreeting(profile?.fullName);

  return (
    <ScreenLayout safeArea="tab" scrollable>
      {isClientHome ? (
        profile?.isClient ? (
          <ClientDashboard />
        ) : (
          <StaggeredFadeIn index={1}>
            <Button
              label="Activar rol cliente"
              onPress={() => router.push(Routes.app.editProfile)}
              variant="dark"
            />
          </StaggeredFadeIn>
        )
      ) : profile?.isProfessional && hasProfessionalServices ? (
        <>
          <StaggeredFadeIn index={0}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <View style={styles.titleRow}>
                  <Image accessibilityIgnoresInvertColors source={rancoBrandIcon} style={styles.brandMark} />
                  <AppText variant="title">Panel profesional</AppText>
                </View>
                <AppText color="textSecondary" variant="body">
                  {personalGreeting}
                </AppText>
              </View>
            </View>
          </StaggeredFadeIn>
          <ProfessionalDashboard />
        </>
      ) : (
        <StaggeredFadeIn index={1}>
          <Button
            label="Configurar servicios"
            onPress={() => router.push(Routes.app.activateProfessional)}
            variant="dark"
          />
        </StaggeredFadeIn>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginBottom: Spacing.md,
  },
  headerText: {
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
