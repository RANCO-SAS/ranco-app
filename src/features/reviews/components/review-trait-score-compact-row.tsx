import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { ReviewTraitDefinition } from '@/features/reviews/constants/review-traits';
import { useTheme } from '@/hooks/use-theme';

type ReviewTraitScoreCompactRowProps = {
  definition: ReviewTraitDefinition;
  value: number;
};

function getCompactTraitLabel(label: string): string {
  const firstWord = label.split(' ')[0] ?? label;
  return firstWord.toUpperCase();
}

export function ReviewTraitScoreCompactRow({ definition, value }: ReviewTraitScoreCompactRowProps) {
  const theme = useTheme();
  const progress = Math.min(Math.max(value / 5, 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText color="textMuted" style={styles.label} variant="caption">
          {getCompactTraitLabel(definition.label)}
        </AppText>
        <AppText variant="caption">{value.toFixed(1)}</AppText>
      </View>

      <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: theme.primary,
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
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  label: {
    flex: 1,
    letterSpacing: 0.4,
  },
  track: {
    height: 4,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
