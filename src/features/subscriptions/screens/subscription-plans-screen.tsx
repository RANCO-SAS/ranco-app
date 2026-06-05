import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout/stack-header';
import { Loader } from '@/components/ui/loader';
import { Spacer } from '@/components/ui/spacer';
import { SuccessLottieOverlay } from '@/components/ui/success-lottie-overlay';
import { AppText } from '@/components/ui/text';
import { Layout, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import {
  BillingCycleToggle,
  type BillingCycleOption,
} from '@/features/subscriptions/components/billing-cycle-toggle';
import { PlanCard } from '@/features/subscriptions/components/plan-card';
import { SUBSCRIPTION_ROLE_COPY } from '@/features/subscriptions/constants/plan-features';
import { useChangeSubscription } from '@/features/subscriptions/hooks/use-change-subscription';
import { useSubscriptionPlans } from '@/features/subscriptions/hooks/use-subscription-plans';
import { useUserSubscription } from '@/features/subscriptions/hooks/use-user-subscription';
import type { SubscriptionPlanTier } from '@/features/subscriptions/types/subscription';
import { useTheme } from '@/hooks/use-theme';

export function SubscriptionPlansScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { activeMode } = useActiveMode();
  const targetRole = activeMode === 'professional' ? 'professional' : 'client';
  const roleCopy = SUBSCRIPTION_ROLE_COPY[targetRole];

  const plansQuery = useSubscriptionPlans(targetRole);
  const subscriptionQuery = useUserSubscription(session?.userId, targetRole);
  const changeSubscription = useChangeSubscription(session?.userId);

  const [billingCycle, setBillingCycle] = useState<BillingCycleOption>('monthly');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const plans = plansQuery.data ?? [];
  const freePlan = plans.find((plan) => plan.tier === 'free');
  const proPlan = plans.find((plan) => plan.tier === 'pro');
  const currentTier = subscriptionQuery.data?.tier ?? 'free';
  const currentBillingCycle = subscriptionQuery.data?.billingCycle ?? 'none';

  const isLoading = plansQuery.isLoading || subscriptionQuery.isLoading;

  const isProCurrentPlan =
    currentTier === 'pro' &&
    (billingCycle === 'monthly'
      ? currentBillingCycle === 'monthly'
      : currentBillingCycle === 'annual');

  const handleChangePlan = (tier: SubscriptionPlanTier) => {
    if (changeSubscription.isPending) {
      return;
    }

    changeSubscription.mutate(
      {
        targetRole,
        tier,
        billingCycle: tier === 'pro' ? billingCycle : 'none',
      },
      {
        onSuccess: () => {
          setSuccessMessage(
            tier === 'pro'
              ? `¡Bienvenido a ${roleCopy.proLabel}!`
              : 'Volviste al plan gratuito.',
          );
          setShowSuccess(true);
        },
      },
    );
  };

  const proCtaLabel = useMemo(() => {
    if (currentTier === 'free') {
      return 'Mejorar ahora';
    }

    if (isProCurrentPlan) {
      return 'Plan actual';
    }

    return billingCycle === 'annual' ? 'Cambiar a anual' : 'Cambiar a mensual';
  }, [billingCycle, currentTier, isProCurrentPlan]);

  if (isLoading) {
    return <Loader message="Cargando planes..." />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StackHeader applyTopInset title="Planes de suscripción" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <AppText variant="title">Elige tu plan</AppText>
          <AppText color="textSecondary" variant="body">
            {roleCopy.subtitle}
          </AppText>
        </View>

        <BillingCycleToggle onChange={setBillingCycle} value={billingCycle} />

        <Spacer size="lg" />

        {freePlan ? (
          <PlanCard
            billingCycle={billingCycle}
            ctaLabel="Volver a gratuito"
            isCurrentPlan={currentTier === 'free'}
            isLoading={changeSubscription.isPending}
            onPress={() => handleChangePlan('free')}
            plan={freePlan}
          />
        ) : null}

        <Spacer size="lg" />

        {proPlan ? (
          <PlanCard
            billingCycle={billingCycle}
            ctaLabel={proCtaLabel}
            isCurrentPlan={currentTier === 'pro' && isProCurrentPlan}
            isLoading={changeSubscription.isPending}
            isRecommended
            onPress={() => handleChangePlan('pro')}
            plan={proPlan}
          />
        ) : null}
      </ScrollView>

      <SuccessLottieOverlay
        message={successMessage}
        onFinish={() => setShowSuccess(false)}
        visible={showSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  hero: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
