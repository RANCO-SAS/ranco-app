import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { UberListRow } from '@/components/ui/uber-list-row';
import { UberSearchField } from '@/components/ui/uber-search-field';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { ServiceCategory } from '@/features/jobs/types/service-category.types';
import {
  searchServiceDomains,
  type ServiceSearchResult,
} from '@/features/jobs/utils/service-search';
import { getCategoryIcon } from '@/features/jobs/utils/category-icons';
import { useTheme } from '@/hooks/use-theme';

type ProfessionalAreasPickerProps = {
  categories: ServiceCategory[];
  value: string[];
  onChange: (subcategoryIds: string[]) => void;
  error?: string;
  disabled?: boolean;
  maxSelections?: number;
};

function LeadingIcon({ slug }: { slug: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.iconCircle, { backgroundColor: theme.backgroundElement }]}>
      <AppText style={styles.icon}>{getCategoryIcon(slug)}</AppText>
    </View>
  );
}

export function ProfessionalAreasPicker({
  categories,
  value,
  onChange,
  error,
  disabled,
  maxSelections,
}: ProfessionalAreasPickerProps) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const isAtMax = maxSelections !== undefined && value.length >= maxSelections;

  const selectedItems = useMemo(() => {
    return categories.flatMap((category) =>
      category.subcategories
        .filter((subcategory) => value.includes(subcategory.id))
        .map((subcategory) => ({
          id: subcategory.id,
          slug: category.slug,
          label: subcategory.name,
          subtitle: category.name,
        })),
    );
  }, [categories, value]);

  const results = useMemo(() => {
    if (query.trim().length < 1 || isAtMax) {
      return [];
    }

    return searchServiceDomains(query, categories, 6).filter(
      (result) => !value.includes(result.subcategoryId),
    );
  }, [categories, isAtMax, query, value]);

  const handleAdd = (result: ServiceSearchResult) => {
    if (isAtMax) {
      return;
    }

    onChange([...value, result.subcategoryId]);
    setQuery('');
  };

  const handleRemove = (subcategoryId: string) => {
    onChange(value.filter((item) => item !== subcategoryId));
  };

  return (
    <View style={styles.wrapper}>
      <AppText color="textMuted" variant="small">
        TUS OFICIOS
      </AppText>

      <UberSearchField
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled && !isAtMax}
        onChangeText={setQuery}
        placeholder={isAtMax ? 'Límite alcanzado' : 'Buscar oficio...'}
        value={query}
      />

      {maxSelections !== undefined ? (
        <AppText color={isAtMax ? 'warning' : 'textSecondary'} variant="caption">
          {isAtMax
            ? `Ya seleccionaste ${maxSelections} servicios. Quita uno para cambiar.`
            : `Puedes agregar hasta ${maxSelections} servicios.`}
        </AppText>
      ) : null}

      {selectedItems.length > 0 ? (
        <View style={[styles.panel, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          {selectedItems.map((item, index) => (
            <UberListRow
              key={item.id}
              isLast={index === selectedItems.length - 1}
              leading={<LeadingIcon slug={item.slug} />}
              onPress={() => handleRemove(item.id)}
              showChevron={false}
              subtitle={item.subtitle}
              title={item.label}
              trailing={
                <AppText color="destructive" variant="caption">
                  Quitar
                </AppText>
              }
            />
          ))}
        </View>
      ) : null}

      {results.length > 0 ? (
        <View style={[styles.panel, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <AppText color="textMuted" style={styles.sectionLabel} variant="small">
            AGREGAR
          </AppText>
          {results.map((result, index) => (
            <UberListRow
              key={result.subcategoryId}
              isLast={index === results.length - 1}
              leading={<LeadingIcon slug={result.categorySlug} />}
              onPress={() => handleAdd(result)}
              subtitle={result.categoryName}
              title={result.subcategoryName}
              trailing={
                <AppText color="primary" variant="caption">
                  Agregar
                </AppText>
              }
            />
          ))}
        </View>
      ) : null}

      {error ? (
        <AppText color="destructive" variant="small">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.md,
  },
  panel: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  sectionLabel: {
    letterSpacing: 0.8,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    lineHeight: 24,
  },
});
