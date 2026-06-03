import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Spacer } from '@/components/ui/spacer';
import { StaggeredFadeIn } from '@/components/ui/staggered-fade-in';
import { AppText } from '@/components/ui/text';
import { UberActionCard } from '@/components/ui/uber-action-card';
import { UberSearchField } from '@/components/ui/uber-search-field';
import { ActiveServiceProgressCard } from '@/features/home/components/active-service-progress-card';
import { ClientHomeHeader } from '@/features/home/components/client-home-header';
import { FeaturedProfessionalsSection } from '@/features/home/components/featured-professionals-section';
import { HomeCategoryCarousel } from '@/features/home/components/home-category-carousel';
import { useClientServiceRequests } from '@/features/jobs/hooks/use-service-requests';
import { useServiceCategories } from '@/features/jobs/hooks/use-service-categories';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';

export function ClientDashboard() {
  const router = useRouter();
  const { profile } = useCurrentProfile();
  const categoriesQuery = useServiceCategories();
  const clientRequestsQuery = useClientServiceRequests(profile?.id);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const categories = categoriesQuery.data ?? [];

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const selectedSubcategoryIds = useMemo(
    () => selectedCategory?.subcategories.map((subcategory) => subcategory.id),
    [selectedCategory],
  );

  const activeService = useMemo(() => {
    const activeStatuses = new Set(['accepted', 'in_progress']);

    return (clientRequestsQuery.data ?? [])
      .filter((request) => activeStatuses.has(request.status))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
  }, [clientRequestsQuery.data]);

  const activeServiceCategorySlug = useMemo(() => {
    if (!activeService) {
      return 'other';
    }

    const category = categories.find((item) => item.id === activeService.categoryId);
    return category?.slug ?? 'other';
  }, [activeService, categories]);

  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      const category = categories.find((item) => item.id === categoryId);
      const firstSubcategory = category?.subcategories[0];

      if (firstSubcategory) {
        router.push({
          pathname: Routes.app.createJob,
          params: {
            categoryId,
            subcategoryId: firstSubcategory.id,
          },
        });
      }

      return;
    }

    setSelectedCategoryId(categoryId);
  };

  return (
    <View style={styles.dashboard}>
      <StaggeredFadeIn index={0}>
        <ClientHomeHeader
          avatarUrl={profile?.avatarUrl}
          fullName={profile?.fullName}
          userId={profile?.id}
        />
      </StaggeredFadeIn>

      <Spacer size="xl" />

      <StaggeredFadeIn index={1}>
        <UberSearchField
          editable={false}
          onPress={() => router.push(Routes.app.createJob)}
          placeholder="¿Qué servicio buscas?"
          showSearchIcon
          value=""
        />
      </StaggeredFadeIn>

      <Spacer size="lg" />

      {categoriesQuery.isLoading ? (
        <Loader message="Cargando categorías..." size="small" variant="inline" />
      ) : categories.length > 0 ? (
        <StaggeredFadeIn index={2}>
          <HomeCategoryCarousel
            categories={categories}
            onSelectCategory={handleCategoryPress}
            selectedCategoryId={selectedCategoryId}
          />
        </StaggeredFadeIn>
      ) : null}

      <Spacer size="xl" />

      <StaggeredFadeIn index={3}>
        <FeaturedProfessionalsSection subcategoryIds={selectedSubcategoryIds} />
      </StaggeredFadeIn>

      {activeService ? (
        <>
          <Spacer size="xl" />
          <StaggeredFadeIn index={4}>
            <ActiveServiceProgressCard
              categorySlug={activeServiceCategorySlug}
              onPressDetails={() => router.push(Routes.app.jobDetail(activeService.id))}
              request={activeService}
            />
          </StaggeredFadeIn>
        </>
      ) : null}

      <Spacer size="xl" />

      <StaggeredFadeIn index={5}>
        <Button
          fullWidth
          label="Nueva solicitud"
          onPress={() => router.push(Routes.app.createJob)}
          size="lg"
          variant="gradient"
        />
      </StaggeredFadeIn>

      <Spacer size="md" />

      <StaggeredFadeIn index={6}>
        <UberActionCard
          onPress={() => router.push(Routes.app.jobs)}
          title="Mis solicitudes"
        />
      </StaggeredFadeIn>

      {selectedCategory ? (
        <>
          <Spacer size="md" />
          <StaggeredFadeIn index={7}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                const firstSubcategory = selectedCategory.subcategories[0];

                if (!firstSubcategory) {
                  return;
                }

                router.push({
                  pathname: Routes.app.createJob,
                  params: {
                    categoryId: selectedCategory.id,
                    subcategoryId: firstSubcategory.id,
                  },
                });
              }}
              style={styles.requestCategoryLink}>
              <AppText color="primary" variant="caption">
                Solicitar servicio de {selectedCategory.name}
              </AppText>
            </Pressable>
          </StaggeredFadeIn>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dashboard: {
    gap: Spacing.md,
  },
  requestCategoryLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
