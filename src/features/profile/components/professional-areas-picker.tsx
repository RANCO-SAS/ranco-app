import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { ActiveServiceCard } from '@/features/profile/components/active-service-card';
import { ServiceAddRow, ServiceSuggestionPill } from '@/features/profile/components/service-add-row';
import type { ServiceCategory } from '@/features/jobs/types/service-category.types';
import {
  buildServiceSearchIndex,
  getPopularServiceSuggestions,
  searchServiceDomains,
  type ServiceSearchResult,
} from '@/features/jobs/utils/service-search';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProfessionalAreasPickerProps = {
  categories: ServiceCategory[];
  value: string[];
  onChange: (subcategoryIds: string[]) => void;
  error?: string;
  disabled?: boolean;
  maxSelections?: number;
};

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
  const maxCount = maxSelections ?? value.length;
  const isAtMax = value.length >= maxCount;
  const remainingSlots = Math.max(maxCount - value.length, 0);

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

  const suggestions = useMemo(() => {
    return getPopularServiceSuggestions(categories, 8).filter(
      (result) => !value.includes(result.subcategoryId),
    );
  }, [categories, value]);

  const browseItems = useMemo(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length > 0) {
      return searchServiceDomains(normalizedQuery, categories, 10).filter(
        (result) => !value.includes(result.subcategoryId),
      );
    }

    return buildServiceSearchIndex(categories)
      .filter((entry) => !value.includes(entry.subcategoryId))
      .slice(0, 12)
      .map((entry) => ({
        categoryId: entry.categoryId,
        subcategoryId: entry.subcategoryId,
        categoryName: entry.categoryName,
        subcategoryName: entry.subcategoryName,
        categorySlug: entry.categorySlug,
        subcategorySlug: entry.subcategorySlug,
        score: 1,
        matchedLabel: entry.subcategoryName,
      }));
  }, [categories, query, value]);

  const handleAdd = (result: ServiceSearchResult) => {
    if (isAtMax || disabled) {
      return;
    }

    onChange([...value, result.subcategoryId]);
    setQuery('');
  };

  const handleRemove = (subcategoryId: string) => {
    if (disabled) {
      return;
    }

    onChange(value.filter((item) => item !== subcategoryId));
  };

  return (
    <View style={styles.wrapper}>
      {selectedItems.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="subtitle">Servicios activos</AppText>
            <View style={[styles.countBadge, { backgroundColor: theme.backgroundElement }]}>
              <View style={[styles.countDot, { backgroundColor: theme.primary }]} />
              <AppText style={styles.countText} variant="small">
                {selectedItems.length} DE {maxCount}
              </AppText>
            </View>
          </View>

          <View style={styles.activeList}>
            {selectedItems.map((item) => (
              <ActiveServiceCard
                key={item.id}
                categorySlug={item.slug}
                disabled={disabled}
                onRemove={() => handleRemove(item.id)}
                subtitle={item.subtitle}
                title={item.label}
              />
            ))}
          </View>
        </View>
      ) : null}

      {!isAtMax ? (
        <View style={styles.section}>
          <View style={styles.sectionIntro}>
            <AppText variant="subtitle">Agregar más servicios</AppText>
            <AppText color="textSecondary" variant="caption">
              {remainingSlots === 1
                ? 'Puedes agregar 1 servicio más a tu perfil profesional.'
                : `Puedes agregar hasta ${remainingSlots} servicios más a tu perfil profesional.`}
            </AppText>
          </View>

          <Input
            autoCapitalize="none"
            autoCorrect={false}
            editable={!disabled}
            leadingIcon="search-outline"
            onChangeText={setQuery}
            placeholder="Buscar servicios..."
            value={query}
          />

          {query.trim().length === 0 && suggestions.length > 0 ? (
            <View style={styles.suggestionsSection}>
              <AppText color="textMuted" style={styles.suggestionsLabel} variant="small">
                SUGERENCIAS
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.suggestionsRow}>
                  {suggestions.map((item) => (
                    <ServiceSuggestionPill
                      key={item.subcategoryId}
                      disabled={disabled}
                      label={item.subcategoryName}
                      onPress={() => handleAdd(item)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : null}

          {browseItems.length > 0 ? (
            <View
              style={[
                styles.browsePanel,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}>
              {browseItems.map((item, index) => (
                <ServiceAddRow
                  key={item.subcategoryId}
                  categorySlug={item.categorySlug}
                  disabled={disabled}
                  isLast={index === browseItems.length - 1}
                  onAdd={() => handleAdd(item)}
                  subtitle={item.categoryName}
                  title={item.subcategoryName}
                />
              ))}
              {browseItems.length > 0 ? (
                <View
                  style={[
                    styles.panelFooter,
                    {
                      borderTopColor: theme.border,
                    },
                  ]}>
                  <AppIcon color={theme.textMuted} name="information-circle-outline" size={14} />
                  <AppText color="textMuted" style={styles.panelFooterText} variant="small">
                    Selecciona los servicios que ofreces actualmente.
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : query.trim().length > 0 ? (
            <AppText color="textSecondary" variant="caption">
              No encontramos servicios para esa búsqueda.
            </AppText>
          ) : null}
        </View>
      ) : (
        <AppText color="warning" variant="caption">
          Has alcanzado el máximo de {maxCount} servicios.
        </AppText>
      )}

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
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  countDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  countText: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  activeList: {
    gap: Spacing.sm,
  },
  sectionIntro: {
    gap: Spacing.xs,
  },
  suggestionsSection: {
    gap: Spacing.sm,
  },
  suggestionsLabel: {
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Layout.screenPaddingHorizontal,
  },
  browsePanel: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  panelFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
  },
  panelFooterText: {
    flex: 1,
  },
});
