import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Spacer } from '@/components/ui/spacer';
import { Routes } from '@/constants/routes';
import { Radius, Spacing } from '@/constants/theme';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useServiceCategories } from '@/features/jobs/hooks/use-service-categories';
import { useTheme } from '@/hooks/use-theme';

export function ProfileRolesSection() {
  const router = useRouter();
  const theme = useTheme();
  const { profile } = useCurrentProfile();
  const categoriesQuery = useServiceCategories();

  if (!profile) {
    return null;
  }

  const selectedServices = categoriesQuery.data
    ? categoriesQuery.data.flatMap((category) =>
        category.subcategories
          .filter((subcategory) => profile.professionalSubcategoryIds.includes(subcategory.id))
          .map((subcategory) => ({
            id: subcategory.id,
            name: subcategory.name,
          })),
      )
    : [];

  return (
    <View style={styles.wrapper}>
      <AppText variant="subtitle">Roles</AppText>

      <Spacer size="sm" />

      <Card>
        <View style={styles.roleHeader}>
          <AppText variant="bodyMedium">Cliente</AppText>
          <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
            <AppText color={profile.isClient ? 'success' : 'textMuted'} variant="small">
              {profile.isClient ? 'Activo' : 'Inactivo'}
            </AppText>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.roleHeader}>
          <AppText variant="bodyMedium">Profesional</AppText>
          <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
            <AppText color={profile.isProfessional ? 'success' : 'textMuted'} variant="small">
              {profile.isProfessional ? 'Activo' : 'Inactivo'}
            </AppText>
          </View>
        </View>

        {profile.isProfessional ? (
          <>
            {selectedServices.length > 0 ? (
              <>
                <Spacer size="sm" />
                <View style={styles.chips}>
                  {selectedServices.map((service) => (
                    <View
                      key={service.id}
                      style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
                      <AppText variant="small">{service.name}</AppText>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
            <Spacer size="md" />
            <Button
              label={selectedServices.length > 0 ? 'Editar servicios' : 'Configurar servicios'}
              onPress={() => router.push(Routes.app.activateProfessional)}
              variant="secondary"
            />
          </>
        ) : (
          <>
            <Spacer size="md" />
            <Button
              label="Activar profesional"
              onPress={() => router.push(Routes.app.activateProfessional)}
              variant="dark"
            />
          </>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
