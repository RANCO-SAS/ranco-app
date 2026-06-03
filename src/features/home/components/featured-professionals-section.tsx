import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';
import { AppText } from '@/components/ui/text';
import { FeaturedProfessionalCard } from '@/features/home/components/featured-professional-card';
import { useFeaturedProfessionals } from '@/features/home/hooks/use-featured-professionals';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';

type FeaturedProfessionalsSectionProps = {
  subcategoryIds?: string[];
};

export function FeaturedProfessionalsSection({
  subcategoryIds,
}: FeaturedProfessionalsSectionProps) {
  const router = useRouter();
  const featuredQuery = useFeaturedProfessionals({ subcategoryIds });

  return (
    <View style={styles.section}>
      <AppText variant="bodyMedium">Profesionales destacados</AppText>

      {featuredQuery.isLoading ? (
        <Loader message="Buscando profesionales..." size="small" variant="inline" />
      ) : featuredQuery.error ? (
        <EmptyState
          description="No pudimos cargar profesionales destacados. Inténtalo de nuevo más tarde."
          title="Algo salió mal"
        />
      ) : (featuredQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          description="Cuando haya profesionales con buena reputación en esta categoría, aparecerán aquí."
          title="Sin profesionales destacados"
        />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {featuredQuery.data?.map((professional) => (
              <FeaturedProfessionalCard
                key={professional.id}
                onPressProfile={() =>
                  router.push(Routes.app.userProfile(professional.id, 'professional'))
                }
                professional={professional}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
});
