import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { ReviewTraitDefinition } from '@/features/reviews/constants/review-traits';
import { useTheme } from '@/hooks/use-theme';

type ReviewTraitScoreRowProps = {
  definition: ReviewTraitDefinition;
  value: number;
};

export function ReviewTraitScoreRow({ definition, value }: ReviewTraitScoreRowProps) {
  const theme = useTheme();
  const progress = Math.min(Math.max(value / 5, 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText style={styles.label} variant="body">
          {definition.label}
        </AppText>
        <View style={styles.scoreRow}>
          <AppText variant="bodyMedium">{value.toFixed(1)}</AppText>
          <AppIcon color={theme.warning} name="star" size={14} />
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: theme.success,
              width: `${Math.max(progress * 100, 4)}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  label: {
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  track: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
