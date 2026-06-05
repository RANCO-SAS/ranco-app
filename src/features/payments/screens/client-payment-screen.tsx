import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout/stack-header';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';
import { Spacer } from '@/components/ui/spacer';
import { SuccessLottieOverlay } from '@/components/ui/success-lottie-overlay';
import { AppText } from '@/components/ui/text';
import { Layout, NegotiationButtonGradients, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useServiceRequest } from '@/features/jobs/hooks/use-service-requests';
import { CLIENT_SERVICE_FEE_PERCENT_LABEL } from '@/features/payments/constants/platform-fee';
import { useAwaitServicePayment } from '@/features/payments/hooks/use-await-service-payment';
import {
  useInvalidatePaymentQueries,
  useSimulateClientPayment,
} from '@/features/payments/hooks/use-payment-mutations';
import type { ServicePayment } from '@/features/payments/types/payment';
import { formatOfferAmount } from '@/features/offers/utils/format-offer-amount';
import { PaymentTermsNotice } from '@/features/legal/components/payment-terms-notice';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

const SIMULATED_CARD_LABEL = 'Tarjeta •••• 4242';

export function ClientPaymentScreen() {
  const theme = useTheme();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestQuery = useServiceRequest(id);
  const paymentQuery = useAwaitServicePayment({
    serviceRequestId: id,
    requestStatus: requestQuery.data?.status,
  });
  const simulatePayment = useSimulateClientPayment();
  const invalidatePaymentQueries = useInvalidatePaymentQueries();
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedMethod] = useState(SIMULATED_CARD_LABEL);
  const paymentSnapshotRef = useRef<ServicePayment | null>(null);

  const request = requestQuery.data;
  const payment = paymentSnapshotRef.current ?? paymentQuery.data;
  const gradient = NegotiationButtonGradients[colorScheme];
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : theme.border;
  const isOwner = session?.userId === request?.clientId;
  const isPaymentFlowLocked = showSuccess || simulatePayment.isPending;
  const canPay = payment?.status === 'awaiting_client_payment';

  if (requestQuery.isLoading || paymentQuery.isResolvingPayment) {
    return <Loader message="Cargando pago..." />;
  }

  if (!request || !isOwner) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <StackHeader applyTopInset title="Pago del servicio" />
        <EmptyState description="No tienes acceso a este pago." title="Pago no disponible" />
      </View>
    );
  }

  if (!isPaymentFlowLocked && (!canPay || paymentQuery.paymentExhausted)) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <StackHeader applyTopInset title="Pago del servicio" />
        <EmptyState
          description="Este servicio ya fue pagado o aún no está listo para cobro."
          title="Pago no pendiente"
        />
      </View>
    );
  }

  if (!payment) {
    return <Loader message="Cargando pago..." />;
  }

  const professional = request.assignedProfessional;
  const amountLabel = formatOfferAmount(payment.amountCents, payment.currency);
  const clientFeeLabel = formatOfferAmount(payment.clientFeeCents, payment.currency);
  const totalLabel = formatOfferAmount(payment.clientTotalCents, payment.currency);

  const handlePay = () => {
    if (!payment) {
      return;
    }

    paymentSnapshotRef.current = payment;

    simulatePayment.mutate(
      {
        serviceRequestId: request.id,
        paymentMethodLabel: selectedMethod,
      },
      {
        onSuccess: () => setShowSuccess(true),
      },
    );
  };

  const handleSuccessFinish = () => {
    setShowSuccess(false);
    paymentSnapshotRef.current = null;
    invalidatePaymentQueries(request.id);
    router.replace(Routes.app.jobDetail(request.id));
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StackHeader applyTopInset title="Pago del servicio" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) + Layout.minTouchTarget },
        ]}
        showsVerticalScrollIndicator={false}>
        <AppText variant="title">Pago del servicio</AppText>
        <AppText color="textSecondary" variant="caption">
          Revisa y confirma tu pago
        </AppText>

        <Spacer size="lg" />

        <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor }]}>
          <View style={styles.workerRow}>
            <Avatar
              imageUrl={professional?.avatarUrl ?? null}
              name={professional?.fullName ?? 'Trabajador'}
              size={52}
            />
            <View style={styles.workerCopy}>
              <AppText variant="bodyMedium">{professional?.fullName ?? 'Trabajador'}</AppText>
              <AppText color="textSecondary" variant="caption">
                {request.categoryName}
              </AppText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <View style={styles.priceRow}>
            <AppText color="textSecondary" variant="caption">
              Precio acordado
            </AppText>
            <AppText variant="subtitle">{amountLabel}</AppText>
          </View>
        </View>

        <Spacer size="lg" />

        <AppText variant="bodyMedium">Método de pago</AppText>
        <Spacer size="sm" />

        <View style={[styles.methodCard, { borderColor: theme.primary, backgroundColor: `${theme.primary}12` }]}>
          <View style={[styles.methodIcon, { backgroundColor: theme.backgroundElement }]}>
            <AppIcon color={theme.primary} name="card-outline" size={20} />
          </View>
          <View style={styles.methodCopy}>
            <AppText variant="bodyMedium">{selectedMethod}</AppText>
            <AppText color="textSecondary" variant="caption">
              Simulación de tarjeta
            </AppText>
          </View>
          <View style={[styles.radio, { borderColor: theme.primary }]}>
            <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
          </View>
        </View>

        <Pressable disabled style={[styles.addMethod, { borderColor }]}>
          <AppIcon color={theme.textMuted} name="add-outline" size={18} />
          <AppText color="textMuted" variant="body">
            Agregar nuevo método
          </AppText>
        </Pressable>

        <Spacer size="lg" />

        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement, borderColor }]}>
          <View style={styles.summaryRow}>
            <AppText color="textSecondary" variant="body">
              Precio acordado
            </AppText>
            <AppText variant="bodyMedium">{amountLabel}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText color="textSecondary" variant="caption">
              Tarifa de servicio Ranco ({CLIENT_SERVICE_FEE_PERCENT_LABEL} adicional)
            </AppText>
            <AppText color="textMuted" variant="caption">
              +{clientFeeLabel}
            </AppText>
          </View>
          <AppText color="textMuted" style={styles.feeHint} variant="small">
            Este cargo adicional se suma al precio pactado y cubre el procesamiento del pago a
            través de Ranco.
          </AppText>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <View style={styles.summaryRow}>
            <AppText variant="bodyMedium">Total a pagar</AppText>
            <AppText style={{ color: theme.primary }} variant="title">
              {totalLabel}
            </AppText>
          </View>
        </View>

        <Spacer size="md" />
        <PaymentTermsNotice />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.background,
            borderTopColor: borderColor,
            paddingBottom: Math.max(insets.bottom, Spacing.md),
          },
        ]}>
        <AnimatedPressable
          accessibilityRole="button"
          disabled={simulatePayment.isPending}
          onPress={handlePay}
          style={{ opacity: simulatePayment.isPending ? 0.6 : 1 }}>
          <LinearGradient
            colors={gradient.primary}
            end={{ x: 1, y: 0.5 }}
            start={{ x: 0, y: 0.5 }}
            style={styles.payButton}>
            <AppIcon color={gradient.primaryIcon} name="lock-closed-outline" size={18} />
            <AppText style={{ color: gradient.primaryText, fontWeight: '700' }} variant="bodyMedium">
              {simulatePayment.isPending ? 'Procesando...' : 'Pagar ahora'}
            </AppText>
          </LinearGradient>
        </AnimatedPressable>
        <AppText align="center" color="textMuted" style={styles.secureCopy} variant="small">
          Pago seguro simulado
        </AppText>
        {simulatePayment.error ? (
          <AppText align="center" color="destructive" variant="caption">
            {simulatePayment.error.message}
          </AppText>
        ) : null}
      </View>

      <SuccessLottieOverlay
        message="¡Pago realizado!"
        onFinish={handleSuccessFinish}
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
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  workerCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  priceRow: {
    gap: Spacing.xs,
  },
  methodCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodCopy: {
    flex: 1,
    gap: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  addMethod: {
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    opacity: 0.6,
  },
  summaryCard: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  feeHint: {
    lineHeight: 18,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  payButton: {
    minHeight: Layout.minTouchTarget + 4,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  secureCopy: {
    marginTop: Spacing.xs,
  },
});
