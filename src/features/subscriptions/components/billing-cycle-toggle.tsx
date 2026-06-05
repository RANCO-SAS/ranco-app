import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { ANNUAL_DISCOUNT_PERCENT } from '@/features/subscriptions/constants/plan-features';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BillingCycleOption = 'monthly' | 'annual';

type BillingCycleToggleProps = {
  value: BillingCycleOption;
  onChange: (value: BillingCycleOption) => void;
};

export function BillingCycleToggle({ value, onChange }: BillingCycleToggleProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'monthly' }}
        onPress={() => onChange('monthly')}
        style={[
          styles.option,
          value === 'monthly' && { backgroundColor: theme.background },
        ]}>
        <AppText variant={value === 'monthly' ? 'bodyMedium' : 'body'}>Mensual</AppText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'annual' }}
        onPress={() => onChange('annual')}
        style={[
          styles.option,
          value === 'annual' && { backgroundColor: theme.background },
        ]}>
        <AppText variant={value === 'annual' ? 'bodyMedium' : 'body'}>Anual</AppText>
        <View style={[styles.discountBadge, { backgroundColor: `${theme.primary}22` }]}>
          <AppText color="primary" variant="small">
            −{ANNUAL_DISCOUNT_PERCENT}%
          </AppText>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  discountBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
});
