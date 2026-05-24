import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { ScreenLayout } from '@/components/layout/screen-layout';
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
  const { activeMode, canSwitchMode } = useActiveMode();
  const categoriesQuery = useServiceCategories();

  const isClientHome = activeMode === 'client';
  const firstName = profile?.fullName?.split(' ')[0];

  const shortcuts = useMemo(
    () => getPopularServiceSuggestions(categoriesQuery.data ?? [], 4),
    [categoriesQuery.data],
  );

  return (
    <ScreenLayout safeArea="tab" scrollable>
      <View style={styles.header}>
        <AppText variant="title">{firstName ? `Hola, ${firstName}` : 'Hola'}</AppText>
        <AppText color="textSecondary" variant="body">
          {isClientHome ? '¿Qué servicio necesitas hoy?' : 'Oportunidades cerca de ti'}
        </AppText>
      </View>

      {canSwitchMode ? (
        <>
          <Pressable accessibilityRole="button" onPress={() => router.push(Routes.app.profile)}>
            <AppText color="textSecondary" variant="caption">
              Modo {isClientHome ? 'cliente' : 'profesional'} activo ·{' '}
              <AppText color="primary" variant="caption">
                Cambiar en Perfil
              </AppText>
            </AppText>
          </Pressable>
          <Spacer size="lg" />
        </>
      ) : null}

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
                <AppText color="textMuted" variant="small">
                  ACCESOS RÁPIDOS
                </AppText>
                <Spacer size="sm" />
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
                        subtitle={item.categoryName}
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
              subtitle="Revisa lo que ya publicaste"
              title="Mis solicitudes"
            />
          </>
        ) : (
          <AppText color="textSecondary" variant="body">
            Activa el rol de cliente en tu perfil para pedir servicios.
          </AppText>
        )
      ) : profile?.isProfessional && (profile.professionalSubcategoryIds.length ?? 0) > 0 ? (
        <>
          <UberActionCard
            onPress={() => router.push(Routes.app.discover)}
            subtitle="Solicitudes que encajan con tu oficio"
            title="Ver oportunidades"
          />
          <Spacer size="md" />
          <UberActionCard
            onPress={() => router.push(Routes.app.activateProfessional)}
            subtitle="Ajusta qué servicios ofreces"
            title="Mis áreas de servicio"
          />
        </>
      ) : (
        <>
          <AppText color="textSecondary" variant="body">
            Configura entre 1 y 3 servicios para activar tu perfil profesional y ver ofertas.
          </AppText>
          <Spacer size="md" />
          <Button
            label="Configurar perfil profesional"
            onPress={() => router.push(Routes.app.activateProfessional)}
            variant="dark"
          />
        </>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
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
