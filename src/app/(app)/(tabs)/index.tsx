import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { ScreenLayout } from '@/components/layout/screen-layout';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { UberActionCard } from '@/components/ui/uber-action-card';
import { UberSearchField } from '@/components/ui/uber-search-field';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { CategoryIcon } from '@/components/ui/category-icon';
import { IosActionCard } from '@/components/ui/ios-action-card';
import { StaggeredFadeIn } from '@/components/ui/staggered-fade-in';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { useServiceCategories } from '@/features/jobs/hooks/use-service-categories';
import { getPopularServiceSuggestions } from '@/features/jobs/utils/service-search';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { formatPersonalGreeting } from '@/shared/utils/format-greeting';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
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
            {!isClientHome ? (
              <AppText variant="title">Panel profesional</AppText>
            ) : (
              <AppText variant="title">{personalGreeting}</AppText>
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
        <View style={styles.dashboard}>
          <View style={styles.gridRow}>
            <StaggeredFadeIn index={1} style={styles.gridItem}>
              <IosActionCard
                featured
                icon={<AppIcon color={theme.primary} name="briefcase-outline" size={28} />}
                onPress={() => router.push(Routes.app.discover)}
                subtitle="Ver trabajos disponibles"
                title="Oportunidades"
              />
            </StaggeredFadeIn>
            <StaggeredFadeIn index={2} style={styles.gridItem}>
              <IosActionCard
                featured
                icon={<AppIcon color={theme.primary} name="construct-outline" size={28} />}
                onPress={() => router.push(Routes.app.activateProfessional)}
                subtitle="Administrar mis habilidades"
                title="Mis servicios"
              />
            </StaggeredFadeIn>
          </View>

          <View style={styles.gridRow}>
            <StaggeredFadeIn index={3} style={styles.gridItem}>
              <IosActionCard
                compact
                icon={<AppIcon color={theme.textMuted} name="person-outline" size={22} />}
                onPress={() => router.push(Routes.app.profile)}
                title="Mi perfil"
              />
            </StaggeredFadeIn>
            <StaggeredFadeIn index={4} style={styles.gridItem}>
              <IosActionCard
                compact
                icon={<AppIcon color={theme.textMuted} name="settings-outline" size={22} />}
                onPress={() => router.push(Routes.app.editProfile)}
                title="Configuración"
              />
            </StaggeredFadeIn>
          </View>
        </View>
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
  dashboard: {
    gap: Spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'stretch',
  },
  gridItem: {
    flex: 1,
    minWidth: 0,
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
