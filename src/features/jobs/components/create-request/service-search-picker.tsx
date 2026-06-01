import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { UberListRow } from '@/components/ui/uber-list-row';
import { UberSearchField } from '@/components/ui/uber-search-field';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { ServiceCategory } from '@/features/jobs/types/service-category.types';
import {
  getPopularServiceSuggestions,
  searchServiceDomains,
  type ServiceSearchResult,
} from '@/features/jobs/utils/service-search';
import { CategoryIcon } from '@/components/ui/category-icon';
import { useTheme } from '@/hooks/use-theme';

type ServiceSearchPickerProps = {
  categories: ServiceCategory[];
  categoryId: string;
  subcategoryId: string;
  onSelect: (result: ServiceSearchResult) => void;
  onClear: () => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

function LeadingIcon({ slug }: { slug: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.iconCircle, { backgroundColor: theme.backgroundElement }]}>
      <CategoryIcon slug={slug} />
    </View>
  );
}

export function ServiceSearchPicker({
  categories,
  categoryId,
  subcategoryId,
  onSelect,
  onClear,
  error,
  disabled,
  autoFocus = true,
}: ServiceSearchPickerProps) {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const selectedResult = useMemo(() => {
    if (!categoryId || !subcategoryId) {
      return null;
    }

    const category = categories.find((item) => item.id === categoryId);
    const subcategory = category?.subcategories.find((item) => item.id === subcategoryId);

    if (!category || !subcategory) {
      return null;
    }

    return {
      categoryId: category.id,
      subcategoryId: subcategory.id,
      categoryName: category.name,
      subcategoryName: subcategory.name,
      categorySlug: category.slug,
      subcategorySlug: subcategory.slug,
      score: 1,
      matchedLabel: subcategory.name,
    } satisfies ServiceSearchResult;
  }, [categories, categoryId, subcategoryId]);

  const results = useMemo(() => {
    if (query.trim().length < 1) {
      return [];
    }

    return searchServiceDomains(query, categories, 10);
  }, [categories, query]);

  const suggestions = useMemo(() => getPopularServiceSuggestions(categories, 8), [categories]);

  const showSuggestions = query.trim().length === 0 && !selectedResult;

  return (
    <View style={styles.wrapper}>
      <UberSearchField
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        editable={!disabled}
        onChangeText={setQuery}
        placeholder="¿Qué necesitas?"
        returnKeyType="search"
        value={query}
      />

      {selectedResult ? (
        <View style={[styles.panel, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <AppText color="textMuted" style={styles.sectionLabel} variant="small">
            SERVICIO SELECCIONADO
          </AppText>
          <UberListRow
            isLast
            leading={<LeadingIcon slug={selectedResult.categorySlug} />}
            onPress={onClear}
            showChevron={false}
            subtitle={selectedResult.categoryName}
            title={selectedResult.subcategoryName}
            trailing={
              <AppText color="primary" variant="caption">
                Cambiar
              </AppText>
            }
          />
        </View>
      ) : null}

      {showSuggestions ? (
        <View style={[styles.panel, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <AppText color="textMuted" style={styles.sectionLabel} variant="small">
            SUGERENCIAS
          </AppText>
          {suggestions.map((suggestion, index) => (
            <UberListRow
              key={suggestion.subcategoryId}
              isLast={index === suggestions.length - 1}
              leading={<LeadingIcon slug={suggestion.categorySlug} />}
              onPress={() => {
                onSelect(suggestion);
                setQuery(suggestion.subcategoryName);
              }}
              subtitle={suggestion.categoryName}
              title={suggestion.subcategoryName}
            />
          ))}
        </View>
      ) : null}

      {results.length > 0 && !selectedResult ? (
        <View style={[styles.panel, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <AppText color="textMuted" style={styles.sectionLabel} variant="small">
            RESULTADOS
          </AppText>
          {results.map((result, index) => (
            <UberListRow
              key={result.subcategoryId}
              isLast={index === results.length - 1}
              leading={<LeadingIcon slug={result.categorySlug} />}
              onPress={() => {
                onSelect(result);
                setQuery(result.subcategoryName);
              }}
              subtitle={
                result.matchedLabel !== result.subcategoryName
                  ? `${result.categoryName} · ${result.matchedLabel}`
                  : result.categoryName
              }
              title={result.subcategoryName}
            />
          ))}
        </View>
      ) : null}

      {query.trim().length >= 2 && results.length === 0 && !selectedResult ? (
        <View style={[styles.panel, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <AppText color="textSecondary" style={styles.emptyText} variant="body">
            No encontramos &quot;{query}&quot;. Prueba con palabras como plomero, limpieza o mecánico.
          </AppText>
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
    gap: Spacing.lg,
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
  emptyText: {
    paddingVertical: Spacing.lg,
  },
});
