import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PlanFeatureListProps = {
  features: string[];
};

export function PlanFeatureList({ features }: PlanFeatureListProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {features.map((feature) => (
        <View key={feature} style={styles.row}>
          <AppIcon color={theme.primary} name="checkmark-circle" size={18} />
          <AppText color="textSecondary" style={styles.text} variant="body">
            {feature}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  text: {
    flex: 1,
  },
});
