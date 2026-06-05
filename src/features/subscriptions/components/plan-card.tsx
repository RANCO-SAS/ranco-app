import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { PlanFeatureList } from '@/features/subscriptions/components/plan-feature-list';
import type { SubscriptionPlan } from '@/features/subscriptions/types/subscription';
import {
  formatSubscriptionPriceLabel,
} from '@/features/subscriptions/utils/format-subscription-price';
import type { BillingCycleOption } from '@/features/subscriptions/components/billing-cycle-toggle';
import { CardGradients, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type PlanCardProps = {
  plan: SubscriptionPlan;
  billingCycle: BillingCycleOption;
  isCurrentPlan: boolean;
  isRecommended?: boolean;
  isLoading?: boolean;
  ctaLabel: string;
  onPress: () => void;
};

export function PlanCard({
  plan,
  billingCycle,
  isCurrentPlan,
  isRecommended = false,
  isLoading = false,
  ctaLabel,
  onPress,
}: PlanCardProps) {
  const theme = useTheme();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const gradients = CardGradients[colorScheme];
  const isPro = plan.tier === 'pro';
  const priceCents =
    billingCycle === 'annual' ? plan.priceAnnualCents : plan.priceMonthlyCents;
  const priceLabel =
    plan.tier === 'free'
      ? '$0 / mes'
      : formatSubscriptionPriceLabel(priceCents, billingCycle);

  return (
    <View
      style={[
        styles.outer,
        {
          borderColor: isPro ? theme.primary : theme.border,
          borderWidth: isPro ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}>
      {isRecommended ? (
        <View style={[styles.ribbon, { backgroundColor: theme.primary }]}>
          <AppText color="primaryForeground" variant="small">
            Recomendado
          </AppText>
        </View>
      ) : null}

      <LinearGradient
        colors={[...gradients.surface]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.header}>
            <AppText variant="subtitle">{plan.name}</AppText>
            <AppText color="textSecondary" variant="caption">
              {plan.description}
            </AppText>
          </View>

          <AppText variant="title">{priceLabel}</AppText>

          <PlanFeatureList features={plan.features} />

          {isCurrentPlan ? (
            <View style={[styles.currentBadge, { backgroundColor: theme.backgroundSecondary }]}>
              <AppText color="textMuted" variant="bodyMedium">
                Plan actual
              </AppText>
            </View>
          ) : (
            <Button
              disabled={isLoading}
              fullWidth
              label={isLoading ? 'Procesando...' : ctaLabel}
              onPress={onPress}
              size="md"
              variant={isPro ? 'gradient' : 'secondary'}
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  ribbon: {
    position: 'absolute',
    top: Spacing.md,
    right: -28,
    zIndex: 1,
    transform: [{ rotate: '45deg' }],
    paddingHorizontal: 32,
    paddingVertical: 4,
  },
  gradient: {
    borderRadius: Radius.xl,
  },
  content: {
    gap: Spacing.lg,
    padding: Spacing.lg,
  },
  header: {
    gap: Spacing.xs,
  },
  currentBadge: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
  },
});
