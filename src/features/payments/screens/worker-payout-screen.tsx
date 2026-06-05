import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout/stack-header';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Spacer } from '@/components/ui/spacer';
import { SuccessLottieOverlay } from '@/components/ui/success-lottie-overlay';
import { AppText } from '@/components/ui/text';
import { Layout, NegotiationButtonGradients, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useServiceRequest } from '@/features/jobs/hooks/use-service-requests';
import { COLOMBIAN_BANKS } from '@/features/payments/constants/colombian-banks';
import { WORKER_SERVICE_FEE_PERCENT_LABEL } from '@/features/payments/constants/platform-fee';
import { useSimulateWorkerPayout, useInvalidatePaymentQueries } from '@/features/payments/hooks/use-payment-mutations';
import { useServicePayment } from '@/features/payments/hooks/use-service-payment';
import {
  payoutSchema,
  type PayoutFormData,
} from '@/features/payments/schemas/payout.schema';
import type { BankAccountType, ServicePayment } from '@/features/payments/types/payment';
import { formatOfferAmount } from '@/features/offers/utils/format-offer-amount';
import { PaymentTermsNotice } from '@/features/legal/components/payment-terms-notice';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useKeyboardLayout } from '@/hooks/use-keyboard-layout';
import { useTheme } from '@/hooks/use-theme';

const ACCOUNT_TYPES: { value: BankAccountType; label: string }[] = [
  { value: 'ahorros', label: 'Ahorros' },
  { value: 'corriente', label: 'Corriente' },
];

export function WorkerPayoutScreen() {
  const theme = useTheme();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestQuery = useServiceRequest(id);
  const paymentQuery = useServicePayment(id);
  const simulatePayout = useSimulateWorkerPayout();
  const invalidatePaymentQueries = useInvalidatePaymentQueries();
  const { keyboardBehavior, keyboardVerticalOffset } = useKeyboardLayout();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBankList, setShowBankList] = useState(false);
  const paymentSnapshotRef = useRef<ServicePayment | null>(null);

  const request = requestQuery.data;
  const payment = paymentSnapshotRef.current ?? paymentQuery.data;
  const gradient = NegotiationButtonGradients[colorScheme];
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : theme.border;
  const isAssignedProfessional = session?.userId === request?.assignedProfessionalId;
  const isPayoutFlowLocked = showSuccess || simulatePayout.isPending;
  const canClaimPayout = payment?.status === 'paid_pending_payout';

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      bankName: COLOMBIAN_BANKS[0],
      accountType: 'ahorros',
      accountNumber: '',
      accountHolderName: '',
    },
    mode: 'onChange',
  });

  const selectedBank = watch('bankName');
  const selectedAccountType = watch('accountType');

  if (requestQuery.isLoading || paymentQuery.isLoading) {
    return <Loader message="Cargando retiro..." />;
  }

  if (!request || !isAssignedProfessional) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <StackHeader applyTopInset title="Retiro de fondos" />
        <EmptyState description="No tienes acceso a este retiro." title="Retiro no disponible" />
      </View>
    );
  }

  if (!isPayoutFlowLocked && !canClaimPayout) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <StackHeader applyTopInset title="Retiro de fondos" />
        <EmptyState
          description="Este pago aún no está disponible para retiro o ya fue procesado."
          title="Retiro no pendiente"
        />
      </View>
    );
  }

  if (!payment) {
    return <Loader message="Cargando retiro..." />;
  }

  const payoutLabel = formatOfferAmount(payment.payoutCents, payment.currency);
  const agreedLabel = formatOfferAmount(payment.amountCents, payment.currency);
  const workerFeeLabel = formatOfferAmount(payment.workerFeeCents, payment.currency);

  const onSubmit = (data: PayoutFormData) => {
    paymentSnapshotRef.current = payment;

    simulatePayout.mutate(
      {
        serviceRequestId: request.id,
        bankName: data.bankName,
        accountType: data.accountType,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
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
    router.replace(Routes.app.home);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StackHeader applyTopInset title="Retiro de fondos" />

      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, Spacing.xl) + Layout.minTouchTarget },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={
              colorScheme === 'dark'
                ? (['#1E3A8A', '#1D4ED8', '#2563EB'] as const)
                : (['#1E40AF', '#2563EB', '#3B82F6'] as const)
            }
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.balanceCard}>
            <AppText color="primaryForeground" style={styles.balanceLabel} variant="small">
              SALDO DISPONIBLE PARA RETIRO
            </AppText>
            <AppText color="primaryForeground" variant="title">
              {payoutLabel}
            </AppText>
          </LinearGradient>

          <Spacer size="lg" />

          <View style={[styles.infoBox, { backgroundColor: theme.backgroundElement, borderColor }]}>
            <AppIcon color={theme.textMuted} name="information-circle-outline" size={18} />
            <View style={styles.infoCopy}>
              <AppText variant="bodyMedium">Comisión de plataforma</AppText>
              <AppText color="textSecondary" variant="caption">
                Del precio acordado ({agreedLabel}), Ranco retiene {WORKER_SERVICE_FEE_PERCENT_LABEL}{' '}
                ({workerFeeLabel}) al procesar tu retiro. El saldo mostrado es lo neto que
                recibirás en tu cuenta.
              </AppText>
            </View>
          </View>

          <Spacer size="md" />
          <PaymentTermsNotice />

          <Spacer size="lg" />

          <AppText variant="bodyMedium">Datos de la cuenta</AppText>
          <Spacer size="md" />

          <AppText color="textSecondary" variant="caption">
            Tipo de cuenta
          </AppText>
          <Spacer size="xs" />
          <View style={styles.segmentRow}>
            {ACCOUNT_TYPES.map((option) => {
              const isSelected = selectedAccountType === option.value;

              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  onPress={() => setValue('accountType', option.value, { shouldValidate: true })}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: isSelected ? theme.backgroundSecondary : theme.backgroundElement,
                      borderColor: isSelected ? theme.primary : borderColor,
                    },
                  ]}>
                  <AppText variant="bodyMedium">{option.label}</AppText>
                </Pressable>
              );
            })}
          </View>
          {errors.accountType ? (
            <AppText color="destructive" variant="small">
              {errors.accountType.message}
            </AppText>
          ) : null}

          <Spacer size="md" />

          <AppText color="textSecondary" variant="caption">
            Banco destino
          </AppText>
          <Spacer size="xs" />
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowBankList((current) => !current)}
            style={[styles.bankSelect, { backgroundColor: theme.backgroundElement, borderColor }]}>
            <AppIcon color={theme.textMuted} name="business-outline" size={18} />
            <AppText style={styles.bankSelectLabel} variant="body">
              {selectedBank}
            </AppText>
            <AppIcon color={theme.textMuted} name={showBankList ? 'chevron-up' : 'chevron-down'} size={18} />
          </Pressable>
          {showBankList ? (
            <View style={[styles.bankList, { borderColor, backgroundColor: theme.backgroundElement }]}>
              {COLOMBIAN_BANKS.map((bank) => (
                <Pressable
                  key={bank}
                  accessibilityRole="button"
                  onPress={() => {
                    setValue('bankName', bank, { shouldValidate: true });
                    setShowBankList(false);
                  }}
                  style={styles.bankOption}>
                  <AppText variant="body">{bank}</AppText>
                </Pressable>
              ))}
            </View>
          ) : null}
          {errors.bankName ? (
            <AppText color="destructive" variant="small">
              {errors.bankName.message}
            </AppText>
          ) : null}

          <Spacer size="md" />

          <Controller
            control={control}
            name="accountNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                error={errors.accountNumber?.message}
                keyboardType="number-pad"
                label="Número de cuenta"
                leadingIcon="card-outline"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Mínimo 6 dígitos"
                value={value}
              />
            )}
          />

          <Spacer size="md" />

          <Controller
            control={control}
            name="accountHolderName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                error={errors.accountHolderName?.message}
                label="Titular de la cuenta"
                leadingIcon="person-outline"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Como aparece en el banco"
                value={value}
              />
            )}
          />

          <Spacer size="md" />

          <View style={[styles.infoBox, { backgroundColor: theme.backgroundElement, borderColor }]}>
            <AppIcon color={theme.textMuted} name="time-outline" size={18} />
            <View style={styles.infoCopy}>
              <AppText variant="bodyMedium">Procesamiento simulado</AppText>
              <AppText color="textSecondary" variant="caption">
                En producción, los fondos llegarían a tu cuenta en 24-48 horas hábiles tras confirmar.
              </AppText>
            </View>
          </View>
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
            disabled={simulatePayout.isPending}
            onPress={handleSubmit(onSubmit)}
            style={{ opacity: simulatePayout.isPending ? 0.6 : 1 }}>
            <LinearGradient
              colors={gradient.primary}
              end={{ x: 1, y: 0.5 }}
              start={{ x: 0, y: 0.5 }}
              style={styles.submitButton}>
              <AppIcon color={gradient.primaryIcon} name="checkmark-circle-outline" size={20} />
              <AppText style={{ color: gradient.primaryText, fontWeight: '700' }} variant="bodyMedium">
                {simulatePayout.isPending ? 'Procesando...' : 'Confirmar y retirar'}
              </AppText>
            </LinearGradient>
          </AnimatedPressable>
          {simulatePayout.error ? (
            <AppText align="center" color="destructive" variant="caption">
              {simulatePayout.error.message}
            </AppText>
          ) : null}
        </View>
      </KeyboardAvoidingView>

      <SuccessLottieOverlay
        message="¡Pago depositado!"
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
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.lg,
  },
  balanceCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  balanceLabel: {
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  infoBox: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  infoCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  segment: {
    flex: 1,
    minHeight: Layout.minTouchTarget,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankSelect: {
    minHeight: Layout.minTouchTarget,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bankSelectLabel: {
    flex: 1,
  },
  bankList: {
    marginTop: Spacing.xs,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  bankOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  submitButton: {
    minHeight: Layout.minTouchTarget + 4,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
});
