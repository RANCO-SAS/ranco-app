import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import {
  CardGradients,
  Layout,
  NegotiationButtonGradients,
  NegotiationButtonSurfaces,
  NegotiationSheetGradients,
  Radius,
  Spacing,
} from '@/constants/theme';
import {
  useAcceptOffer,
  useCounterOffer,
  useCreateOffer,
  useDeclineOffer,
  useWithdrawOffer,
} from '@/features/offers/hooks/use-offer-mutations';
import { offerAmountSchema } from '@/features/offers/schemas/offer.schema';
import type { ServiceOffer } from '@/features/offers/types/offer';
import {
  formatOfferAmount,
  formatOfferAmountInput,
  parseOfferAmountInput,
} from '@/features/offers/utils/format-offer-amount';
import { getOfferWaitingHint } from '@/features/offers/utils/get-offer-status-hint';
import { PaymentTermsNotice } from '@/features/legal/components/payment-terms-notice';
import { ClientServiceTotalPreview } from '@/features/payments/components/client-service-total-preview';
import { WorkerServiceEarningsPreview } from '@/features/payments/components/worker-service-earnings-preview';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export type NegotiationBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type NegotiationBottomSheetProps = {
  conversationId: string;
  userId: string;
  isViewerClient: boolean;
  serviceRequestTitle: string;
  pendingOffer: ServiceOffer | null | undefined;
  isConversationClosed: boolean;
};

type SurfaceSectionProps = {
  children: ReactNode;
  featured?: boolean;
};

function NegotiationSheetBackground({ style }: BottomSheetBackgroundProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const sheetColors = NegotiationSheetGradients[colorScheme].sheet;

  return (
    <LinearGradient
      colors={[...sheetColors]}
      end={{ x: 0.5, y: 1 }}
      start={{ x: 0.5, y: 0 }}
      style={[style, styles.sheetBackground]}
    />
  );
}

function SurfaceSection({ children, featured = false }: SurfaceSectionProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const cardGradients = CardGradients[colorScheme];
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : theme.border;

  if (featured) {
    return (
      <View style={[styles.surfaceOuter, { borderColor }]}>
        <LinearGradient
          colors={[...cardGradients.surface]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.surfaceInner}>
          <LinearGradient
            colors={[...cardGradients.glow]}
            end={{ x: 1, y: 0.85 }}
            pointerEvents="none"
            start={{ x: 0, y: 0 }}
            style={styles.surfaceGlow}
          />
          {children}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.surfaceOuter,
        styles.surfacePlain,
        { backgroundColor: theme.backgroundElement, borderColor },
      ]}>
      {children}
    </View>
  );
}

type NegotiationButtonProps = {
  disabled?: boolean;
  icon?: AppIconName;
  label: string;
  onPress: () => void;
};

function NegotiationPrimaryButton({ disabled, icon, label, onPress }: NegotiationButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const gradient = NegotiationButtonGradients[colorScheme];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.actionButtonShell, { opacity: disabled ? 0.5 : 1 }]}>
      <LinearGradient
        colors={[...gradient.primary]}
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={styles.primaryAction}>
        {icon ? <AppIcon color={gradient.primaryIcon} name={icon} size={20} /> : null}
        <AppText style={[styles.primaryActionLabel, { color: gradient.primaryText }]} variant="bodyMedium">
          {label}
        </AppText>
      </LinearGradient>
    </AnimatedPressable>
  );
}

function NegotiationOutlineButton({ disabled, label, onPress }: NegotiationButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const surface = NegotiationButtonSurfaces[colorScheme].outline;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButtonShell,
        styles.outlineAction,
        {
          backgroundColor: surface.background,
          borderColor: surface.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}>
      <AppText style={[styles.outlineActionLabel, { color: surface.text }]} variant="bodyMedium">
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

function NegotiationMutedDestructiveButton({ disabled, label, onPress }: NegotiationButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const surface = NegotiationButtonSurfaces[colorScheme].mutedDestructive;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButtonShell,
        styles.outlineAction,
        {
          backgroundColor: surface.background,
          borderColor: surface.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}>
      <AppText style={[styles.outlineActionLabel, { color: surface.text }]} variant="bodyMedium">
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

export const NegotiationBottomSheet = forwardRef<
  NegotiationBottomSheetRef,
  NegotiationBottomSheetProps
>(function NegotiationBottomSheet(
  {
    conversationId,
    userId,
    isViewerClient,
    serviceRequestTitle,
    pendingOffer,
    isConversationClosed,
  },
  ref,
) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const sheetTheme = NegotiationSheetGradients[colorScheme];
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['88%'], []);
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [showAmountInput, setShowAmountInput] = useState(false);

  const createOffer = useCreateOffer();
  const counterOffer = useCounterOffer();
  const acceptOffer = useAcceptOffer();
  const withdrawOffer = useWithdrawOffer();
  const declineOffer = useDeclineOffer();

  const isPending =
    createOffer.isPending ||
    counterOffer.isPending ||
    acceptOffer.isPending ||
    withdrawOffer.isPending ||
    declineOffer.isPending;

  const isProposer = pendingOffer?.proposerId === userId;
  const isRecipient = Boolean(pendingOffer && !isProposer);
  const offerWaitingHint = getOfferWaitingHint(isViewerClient);
  const parsedAmount = parseOfferAmountInput(amountInput);
  const shouldShowAmountField = !pendingOffer || showAmountInput;
  const previewAmountCents =
    shouldShowAmountField && parsedAmount !== null && parsedAmount > 0
      ? parsedAmount
      : pendingOffer?.amountCents ?? null;
  const clientPreviewAmountCents = isViewerClient ? previewAmountCents : null;
  const workerPreviewAmountCents = !isViewerClient ? previewAmountCents : null;
  const insetFieldBg =
    colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.72)';

  const resetForm = useCallback(() => {
    setAmountInput('');
    setAmountError(null);
    setShowAmountInput(false);
  }, []);

  useImperativeHandle(ref, () => ({
    present: () => {
      resetForm();
      requestAnimationFrame(() => {
        sheetRef.current?.present();
      });
    },
    dismiss: () => {
      sheetRef.current?.dismiss();
    },
  }));

  const handleDismiss = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.55} />
    ),
    [],
  );

  const renderBackground = useCallback(
    (props: BottomSheetBackgroundProps) => <NegotiationSheetBackground {...props} />,
    [],
  );

  const validateAmount = (): number | null => {
    const result = offerAmountSchema.safeParse({ amount: parsedAmount ?? 0 });

    if (!result.success) {
      setAmountError(result.error.issues[0]?.message ?? 'Monto inválido');
      return null;
    }

    setAmountError(null);
    return result.data.amount;
  };

  const closeSheet = () => {
    sheetRef.current?.dismiss();
  };

  const handleCreateOffer = () => {
    const amount = validateAmount();

    if (amount === null) {
      return;
    }

    createOffer.mutate(
      { conversationId, amountCents: amount },
      {
        onSuccess: () => {
          resetForm();
          closeSheet();
        },
      },
    );
  };

  const handleCounterOffer = () => {
    if (!pendingOffer) {
      return;
    }

    const amount = validateAmount();

    if (amount === null) {
      return;
    }

    counterOffer.mutate(
      {
        conversationId,
        parentOfferId: pendingOffer.id,
        amountCents: amount,
      },
      {
        onSuccess: () => {
          resetForm();
          closeSheet();
        },
      },
    );
  };

  const handleAccept = () => {
    if (!pendingOffer) {
      return;
    }

    acceptOffer.mutate(
      { conversationId, offerId: pendingOffer.id },
      { onSuccess: closeSheet },
    );
  };

  const handleWithdraw = () => {
    if (!pendingOffer) {
      return;
    }

    withdrawOffer.mutate(
      { conversationId, offerId: pendingOffer.id },
      {
        onSuccess: () => {
          resetForm();
          closeSheet();
        },
      },
    );
  };

  const handleDeclineOffer = () => {
    if (!pendingOffer) {
      return;
    }

    declineOffer.mutate(
      { conversationId, offerId: pendingOffer.id },
      {
        onSuccess: () => {
          resetForm();
          closeSheet();
        },
      },
    );
  };

  const handleCancelOffer = () => {
    if (isProposer) {
      handleWithdraw();
      return;
    }

    handleDeclineOffer();
  };

  const mutationError =
    createOffer.error?.message ??
    counterOffer.error?.message ??
    acceptOffer.error?.message ??
    withdrawOffer.error?.message ??
    declineOffer.error?.message ??
    null;

  const isCancellingOffer = withdrawOffer.isPending || declineOffer.isPending;

  return (
    <BottomSheetModal
      ref={sheetRef}
      backdropComponent={renderBackdrop}
      backgroundComponent={renderBackground}
      backgroundStyle={styles.sheetTransparent}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: theme.textMuted, width: 40, height: 4 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={handleDismiss}
      snapPoints={snapPoints}>
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <AppText variant="title">Negociación de servicio</AppText>
            <AppText color="textSecondary" variant="caption">
              Acuerda el precio del servicio en COP
            </AppText>
          </View>
          <Pressable
            accessibilityLabel="Cerrar"
            accessibilityRole="button"
            hitSlop={8}
            onPress={closeSheet}
            style={[styles.closeButton, { backgroundColor: theme.backgroundElement }]}>
            <AppIcon color={theme.textSecondary} name="close" size={18} />
          </Pressable>
        </View>

        <SurfaceSection>
          <View style={styles.serviceRow}>
            <View style={[styles.serviceIcon, { backgroundColor: `${theme.primary}20` }]}>
              <AppIcon color={theme.primary} name="construct-outline" size={20} />
            </View>
            <View style={styles.serviceCopy}>
              <AppText color="textMuted" style={styles.sectionLabel} variant="small">
                SERVICIO SOLICITADO
              </AppText>
              <AppText variant="bodyMedium">{serviceRequestTitle}</AppText>
            </View>
          </View>
        </SurfaceSection>

        {isConversationClosed ? (
          <AppText color="textSecondary" variant="body">
            Esta conversación está cerrada y ya no admite ofertas.
          </AppText>
        ) : (
          <>
            <SurfaceSection featured={Boolean(pendingOffer)}>
              <View style={styles.offerPanel}>
                {pendingOffer ? (
                  <LinearGradient
                    colors={[...sheetTheme.pendingBadge]}
                    end={{ x: 1, y: 0.5 }}
                    start={{ x: 0, y: 0.5 }}
                    style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <AppText style={styles.statusBadgeText} variant="small">
                      PENDIENTE
                    </AppText>
                  </LinearGradient>
                ) : null}

                <AppText color="textMuted" style={styles.sectionLabel} variant="small">
                  OFERTA ACTUAL
                </AppText>

                {pendingOffer ? (
                  <>
                    <AppText style={[styles.amountDisplay, { color: sheetTheme.amount }]}>
                      {formatOfferAmount(pendingOffer.amountCents, pendingOffer.currency)}
                    </AppText>
                    {!isViewerClient ? (
                      <AppText color="textMuted" style={styles.offerSubLabel} variant="small">
                        Precio en negociación
                      </AppText>
                    ) : null}
                    <AppText color="textSecondary" style={styles.offerHint} variant="caption">
                      {isProposer
                        ? offerWaitingHint
                        : 'Puedes aceptar, contraofertar o responder.'}
                    </AppText>
                  </>
                ) : (
                  <AppText color="textSecondary" style={styles.offerHint} variant="body">
                    Aún no hay una oferta activa. Propón un precio para iniciar la negociación.
                  </AppText>
                )}
              </View>
            </SurfaceSection>

            {shouldShowAmountField ? (
              <View style={styles.inputSection}>
                <AppText color="textMuted" style={styles.sectionLabel} variant="small">
                  {pendingOffer && isRecipient ? 'TU CONTRAOFERTA' : 'INGRESA TU PROPUESTA ECONÓMICA'}
                </AppText>
                <View
                  style={[
                    styles.amountInputShell,
                    {
                      backgroundColor: insetFieldBg,
                      borderColor: amountError ? theme.destructive : theme.border,
                    },
                  ]}>
                  <AppText color="textMuted" variant="bodyMedium">
                    $
                  </AppText>
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={(text) => {
                      const parsed = parseOfferAmountInput(text);
                      setAmountInput(parsed === null ? '' : formatOfferAmountInput(parsed));
                      setAmountError(null);
                    }}
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    style={[styles.amountInput, { color: theme.text }]}
                    value={amountInput}
                  />
                  <AppText color="textMuted" variant="caption">
                    COP
                  </AppText>
                </View>
                {amountError ? (
                  <AppText color="destructive" variant="small">
                    {amountError}
                  </AppText>
                ) : null}
              </View>
            ) : null}

            {clientPreviewAmountCents ? (
              <ClientServiceTotalPreview amountCents={clientPreviewAmountCents} />
            ) : null}

            {workerPreviewAmountCents ? (
              <WorkerServiceEarningsPreview amountCents={workerPreviewAmountCents} />
            ) : null}

            <PaymentTermsNotice compact onOpenTerms={closeSheet} />

            {isRecipient && pendingOffer && !showAmountInput ? (
              <View style={styles.actionsBlock}>
                <NegotiationPrimaryButton
                  disabled={isPending}
                  icon="checkmark-circle-outline"
                  label={acceptOffer.isPending ? 'Aceptando...' : 'Aceptar oferta'}
                  onPress={handleAccept}
                />
                <View style={styles.secondaryActionsRow}>
                  <View style={styles.secondaryActionHalf}>
                    <NegotiationOutlineButton
                      disabled={isPending}
                      label="Contraofertar"
                      onPress={() => setShowAmountInput(true)}
                    />
                  </View>
                  <View style={styles.secondaryActionHalf}>
                    <NegotiationMutedDestructiveButton
                      disabled={isPending}
                      label={declineOffer.isPending ? 'Cancelando...' : 'Cancelar oferta'}
                      onPress={handleDeclineOffer}
                    />
                  </View>
                </View>
              </View>
            ) : null}

            {isRecipient && pendingOffer && showAmountInput ? (
              <View style={styles.actionsBlock}>
                <NegotiationPrimaryButton
                  disabled={isPending}
                  icon="repeat-outline"
                  label={counterOffer.isPending ? 'Enviando...' : 'Enviar contraoferta'}
                  onPress={handleCounterOffer}
                />
                <View style={styles.secondaryActionsRow}>
                  <View style={styles.secondaryActionHalf}>
                    <NegotiationOutlineButton
                      disabled={isPending}
                      label="Volver"
                      onPress={() => {
                        setShowAmountInput(false);
                        setAmountInput('');
                        setAmountError(null);
                      }}
                    />
                  </View>
                  <View style={styles.secondaryActionHalf}>
                    <NegotiationMutedDestructiveButton
                      disabled={isPending}
                      label={declineOffer.isPending ? 'Cancelando...' : 'Cancelar oferta'}
                      onPress={handleDeclineOffer}
                    />
                  </View>
                </View>
              </View>
            ) : null}

            {isProposer && pendingOffer ? (
              <View style={styles.actionsBlock}>
                <NegotiationMutedDestructiveButton
                  disabled={isPending}
                  label={isCancellingOffer ? 'Cancelando...' : 'Cancelar oferta'}
                  onPress={handleCancelOffer}
                />
              </View>
            ) : null}

            {!pendingOffer ? (
              <View style={styles.actionsBlock}>
                <NegotiationPrimaryButton
                  disabled={isPending}
                  icon="send-outline"
                  label={createOffer.isPending ? 'Enviando...' : 'Enviar propuesta'}
                  onPress={handleCreateOffer}
                />
              </View>
            ) : null}

            {mutationError ? (
              <AppText color="destructive" variant="caption">
                {mutationError}
              </AppText>
            ) : null}
          </>
        )}

        <Spacer size="lg" />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetTransparent: {
    backgroundColor: 'transparent',
  },
  sheetBackground: {
    borderTopLeftRadius: Radius.xl + 4,
    borderTopRightRadius: Radius.xl + 4,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingTop: Spacing.xs,
  },
  headerCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surfaceOuter: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  surfacePlain: {
    padding: Spacing.lg,
  },
  surfaceInner: {
    position: 'relative',
    padding: Spacing.lg,
  },
  surfaceGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  sectionLabel: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  offerPanel: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginBottom: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: '#FFFFFF',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  amountDisplay: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  offerHint: {
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  offerSubLabel: {
    textAlign: 'center',
  },
  inputSection: {
    gap: Spacing.sm,
  },
  amountInputShell: {
    minHeight: Layout.minTouchTarget + 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    paddingVertical: Spacing.sm,
  },
  actionsBlock: {
    gap: Spacing.sm,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryActionHalf: {
    flex: 1,
  },
  actionButtonShell: {
    alignSelf: 'stretch',
  },
  primaryAction: {
    minHeight: Layout.minTouchTarget + 4,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  primaryActionLabel: {
    fontWeight: '700',
  },
  outlineAction: {
    minHeight: Layout.minTouchTarget + 4,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineActionLabel: {
    fontWeight: '600',
  },
});
