import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { ZoomableImage } from '@/components/ui/zoomable-image';
import { Radius, Spacing } from '@/constants/theme';
import type { CreateServiceRequestFormData } from '@/features/jobs/schemas/create-service-request.schema';
import type { ServiceCategory } from '@/features/jobs/types/service-category.types';
import type { ServiceRequestPhotoItem } from '@/features/jobs/types/service-request-photo.types';
import type { ServiceRequestUrgency } from '@/features/jobs/types/service-request.types';
import { CategoryIcon } from '@/components/ui/category-icon';
import { useTheme } from '@/hooks/use-theme';

const URGENCY_LABELS: Record<ServiceRequestUrgency, string> = {
  low: 'Flexible',
  normal: 'Normal',
  high: 'Pronto',
  urgent: 'Urgente',
};

type RequestSummaryCardProps = {
  values: CreateServiceRequestFormData;
  categories: ServiceCategory[];
  photos?: ServiceRequestPhotoItem[];
};

export function RequestSummaryCard({ values, categories, photos = [] }: RequestSummaryCardProps) {
  const theme = useTheme();
  const category = categories.find((item) => item.id === values.categoryId);
  const subcategory = category?.subcategories.find((item) => item.id === values.subcategoryId);

  return (
    <Card>
      <View style={styles.header}>
        <CategoryIcon slug={category?.slug ?? 'other'} />
        <View style={styles.headerText}>
          <AppText variant="caption" color="primary">
            {category?.name ?? 'Categoría'} · {subcategory?.name ?? 'Subcategoría'}
          </AppText>
          <AppText variant="subtitle">{values.title}</AppText>
        </View>
      </View>

      <AppText color="textSecondary" numberOfLines={4} variant="body">
        {values.description}
      </AppText>

      <View style={styles.meta}>
        <AppText color="textMuted" variant="small">
          Urgencia: {URGENCY_LABELS[values.urgency]}
        </AppText>
        {values.locationLabel ? (
          <AppText color="textMuted" variant="small">
            Ubicación: {values.locationLabel}
          </AppText>
        ) : null}
        {photos.length > 0 ? (
          <AppText color="textMuted" variant="small">
            Fotos: {photos.length}
          </AppText>
        ) : null}
      </View>

      {photos.length > 0 ? (
        <>
          <Spacer size="sm" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photoRow}>
              {photos.map((photo) => (
                <ZoomableImage
                  key={photo.id}
                  contentFit="cover"
                  style={[styles.photo, { backgroundColor: theme.backgroundElement }]}
                  uri={photo.uri}
                />
              ))}
            </View>
          </ScrollView>
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 32,
    lineHeight: 36,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  meta: {
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  photoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
  },
});
