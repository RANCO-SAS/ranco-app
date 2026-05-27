import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { UberActionCard } from '@/components/ui/uber-action-card';
import { UberSearchField } from '@/components/ui/uber-search-field';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { useServiceCategories } from '@/features/jobs/hooks/use-service-categories';
import { getPopularServiceSuggestions } from '@/features/jobs/utils/service-search';
import { getCategoryIcon } from '@/features/jobs/utils/category-icons';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const categoriesQuery = useServiceCategories();

  const isClientHome = activeMode === 'client';
  const firstName = profile?.fullName?.split(' ')[0];

  const shortcuts = useMemo(
    () => getPopularServiceSuggestions(categoriesQuery.data ?? [], 4),
    [categoriesQuery.data],
  );

  return (
    <ScreenLayout safeArea="tab" scrollable>
      <View style={styles.headerRow}>
        <AppText variant="title">{firstName ? `Hola, ${firstName}` : 'Hola'}</AppText>
        <NotificationBell />
      </View>

      <Spacer size="lg" />

      {isClientHome ? (
        profile?.isClient ? (
          <>
            <UberSearchField
              editable={false}
              onPress={() => router.push(Routes.app.createJob)}
              placeholder="¿Qué necesitas?"
              showSearchIcon
              value=""
            />

            <Spacer size="lg" />

            {shortcuts.length > 0 ? (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.shortcuts}>
                    {shortcuts.map((item) => (
                      <View key={item.subcategoryId} style={styles.shortcutCard}>
                        <UberActionCard
                          leading={
                            <AppText style={styles.shortcutIcon}>
                              {getCategoryIcon(item.categorySlug)}
                            </AppText>
                          }
                          onPress={() => router.push(Routes.app.createJob)}
                          title={item.subcategoryName}
                        />
                      </View>
                    ))}
                  </View>
                </ScrollView>
                <Spacer size="lg" />
              </>
            ) : null}

            <UberActionCard
              onPress={() => router.push(Routes.app.jobs)}
              title="Mis solicitudes"
            />
          </>
        ) : (
          <Button
            label="Activar rol cliente"
            onPress={() => router.push(Routes.app.editProfile)}
            variant="dark"
          />
        )
      ) : profile?.isProfessional && (profile.professionalSubcategoryIds.length ?? 0) > 0 ? (
        <>
          <UberActionCard
            onPress={() => router.push(Routes.app.discover)}
            title="Oportunidades"
          />
          <Spacer size="md" />
          <UberActionCard
            onPress={() => router.push(Routes.app.activateProfessional)}
            title="Mis servicios"
          />
        </>
      ) : (
        <Button
          label="Configurar servicios"
          onPress={() => router.push(Routes.app.activateProfessional)}
          variant="dark"
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shortcuts: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  shortcutIcon: {
    fontSize: 24,
    lineHeight: 28,
  },
  shortcutCard: {
    width: 240,
  },
});
