import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { UberActionCard } from '@/components/ui/uber-action-card';
import { UberSearchField } from '@/components/ui/uber-search-field';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { CategoryIcon } from '@/components/ui/category-icon';
import { StaggeredFadeIn } from '@/components/ui/staggered-fade-in';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { ProfessionalDashboard } from '@/features/home/components/professional-dashboard';
import { useServiceCategories } from '@/features/jobs/hooks/use-service-categories';
import { getPopularServiceSuggestions } from '@/features/jobs/utils/service-search';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { formatPersonalGreeting } from '@/shared/utils/format-greeting';

const rancoBrandIcon = require('@/assets/images/ranco-icon.png');

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const categoriesQuery = useServiceCategories();

  const isClientHome = activeMode === 'client';
  const personalGreeting = formatPersonalGreeting(profile?.fullName);
  const hasProfessionalServices = (profile?.professionalSubcategoryIds.length ?? 0) > 0;

  const shortcuts = useMemo(
    () => getPopularServiceSuggestions(categoriesQuery.data ?? [], 4),
    [categoriesQuery.data],
  );

  return (
    <ScreenLayout safeArea="tab" scrollable>
      <StaggeredFadeIn index={0}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            {isClientHome ? (
              <AppText variant="title">{personalGreeting}</AppText>
            ) : (
              <View style={styles.titleRow}>
                <Image accessibilityIgnoresInvertColors source={rancoBrandIcon} style={styles.brandMark} />
                <AppText variant="title">Panel profesional</AppText>
              </View>
            )}
            {!isClientHome ? (
              <AppText color="textSecondary" variant="body">
                {personalGreeting}
              </AppText>
            ) : null}
          </View>
          <NotificationBell />
        </View>
      </StaggeredFadeIn>

      <Spacer size="xl" />

      {isClientHome ? (
        profile?.isClient ? (
          <>
            <StaggeredFadeIn index={1}>
              <UberSearchField
                editable={false}
                onPress={() => router.push(Routes.app.createJob)}
                placeholder="¿Qué necesitas?"
                showSearchIcon
                value=""
              />
            </StaggeredFadeIn>

            <Spacer size="lg" />

            {shortcuts.length > 0 ? (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.shortcuts}>
                    {shortcuts.map((item, index) => (
                      <StaggeredFadeIn index={index + 2} key={item.subcategoryId} style={styles.shortcutCard}>
                        <UberActionCard
                          leading={<CategoryIcon slug={item.categorySlug} />}
                          onPress={() => router.push(Routes.app.createJob)}
                          title={item.subcategoryName}
                        />
                      </StaggeredFadeIn>
                    ))}
                  </View>
                </ScrollView>
                <Spacer size="lg" />
              </>
            ) : null}

            <StaggeredFadeIn index={6}>
              <UberActionCard
                onPress={() => router.push(Routes.app.jobs)}
                title="Mis solicitudes"
              />
            </StaggeredFadeIn>
          </>
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
        <ProfessionalDashboard />
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
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
  shortcuts: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  shortcutCard: {
    width: 240,
  },
});
