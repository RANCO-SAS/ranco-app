import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import type { CreateServiceRequestFormData } from '@/features/jobs/schemas/create-service-request.schema';
import type { ServiceCategory } from '@/features/jobs/types/service-category.types';
import type { ServiceRequestUrgency } from '@/features/jobs/types/service-request.types';
import { getCategoryIcon } from '@/features/jobs/utils/category-icons';

const URGENCY_LABELS: Record<ServiceRequestUrgency, string> = {
  low: 'Flexible',
  normal: 'Normal',
  high: 'Pronto',
  urgent: 'Urgente',
};

type RequestSummaryCardProps = {
  values: CreateServiceRequestFormData;
  categories: ServiceCategory[];
};

export function RequestSummaryCard({ values, categories }: RequestSummaryCardProps) {
  const category = categories.find((item) => item.id === values.categoryId);
  const subcategory = category?.subcategories.find((item) => item.id === values.subcategoryId);

  return (
    <Card>
      <View style={styles.header}>
        <AppText style={styles.icon}>{getCategoryIcon(category?.slug ?? 'other')}</AppText>
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
      </View>
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
});
