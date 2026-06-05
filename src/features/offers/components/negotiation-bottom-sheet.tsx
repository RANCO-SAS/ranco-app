import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import {
  useAcceptOffer,
  useCounterOffer,
  useCreateOffer,
  useWithdrawOffer,
} from '@/features/offers/hooks/use-offer-mutations';
import { offerAmountSchema } from '@/features/offers/schemas/offer.schema';
import type { ServiceOffer } from '@/features/offers/types/offer';
import {
  formatOfferAmount,
  formatOfferAmountInput,
  parseOfferAmountInput,
} from '@/features/offers/utils/format-offer-amount';
import { useTheme } from '@/hooks/use-theme';

type NegotiationBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  conversationId: string;
  userId: string;
  serviceRequestTitle: string;
  pendingOffer: ServiceOffer | null | undefined;
  isConversationClosed: boolean;
};

export function NegotiationBottomSheet({
  visible,
  onClose,
  conversationId,
  userId,
  serviceRequestTitle,
  pendingOffer,
  isConversationClosed,
}: NegotiationBottomSheetProps) {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['72%'], []);
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'propose' | 'counter'>('view');

  const createOffer = useCreateOffer();
  const counterOffer = useCounterOffer();
  const acceptOffer = useAcceptOffer();
  const withdrawOffer = useWithdrawOffer();

  const isPending =
    createOffer.isPending ||
    counterOffer.isPending ||
    acceptOffer.isPending ||
    withdrawOffer.isPending;

  const isProposer = pendingOffer?.proposerId === userId;
  const isRecipient = Boolean(pendingOffer && !isProposer);
  const parsedAmount = parseOfferAmountInput(amountInput);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
      setMode('view');
      setAmountInput('');
      setAmountError(null);
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.55} />
    ),
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

  const handleCreateOffer = () => {
    const amount = validateAmount();

    if (amount === null) {
      return;
    }

    createOffer.mutate(
      { conversationId, amountCents: amount },
      {
        onSuccess: () => {
          setMode('view');
          setAmountInput('');
          onClose();
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
          setMode('view');
          setAmountInput('');
          onClose();
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
      { onSuccess: onClose },
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
          setMode('view');
          onClose();
        },
      },
    );
  };

  const mutationError =
    createOffer.error?.message ??
    counterOffer.error?.message ??
    acceptOffer.error?.message ??
    withdrawOffer.error?.message ??
    null;

  return (
    <BottomSheetModal
      ref={sheetRef}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.backgroundSecondary }}
      handleIndicatorStyle={{ backgroundColor: theme.textMuted }}
      onDismiss={handleDismiss}
      snapPoints={snapPoints}>
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <AppText variant="title">Negociación de servicio</AppText>
          <AppText color="textSecondary" variant="caption">
            Define el precio del servicio en COP
          </AppText>
        </View>

        <View style={[styles.serviceCard, { backgroundColor: theme.backgroundElement }]}>
          <AppText variant="bodyMedium">{serviceRequestTitle}</AppText>
        </View>

        {isConversationClosed ? (
          <AppText color="textSecondary" variant="body">
            Esta conversación está cerrada y ya no admite ofertas.
          </AppText>
        ) : (
          <>
            <View style={[styles.offerBlock, { borderColor: theme.border }]}>
              <AppText color="textSecondary" variant="caption">
                Oferta actual
              </AppText>
              {pendingOffer ? (
                <>
                  <AppText variant="title">
                    {formatOfferAmount(pendingOffer.amountCents, pendingOffer.currency)}
                  </AppText>
                  <AppText color="textSecondary" variant="caption">
                    {isProposer
                      ? 'Esperando respuesta del otro participante.'
                      : 'Puedes aceptar, contraofertar o esperar.'}
                  </AppText>
                </>
              ) : (
                <AppText color="textSecondary" variant="body">
                  Aún no hay una oferta activa. Propón un precio para iniciar la negociación.
                </AppText>
              )}
            </View>

            {(mode === 'propose' || mode === 'counter') && (
              <>
                <Input
                  error={amountError ?? undefined}
                  keyboardType="number-pad"
                  label="Monto en COP"
                  onChangeText={(text) => {
                    const parsed = parseOfferAmountInput(text);
                    setAmountInput(parsed === null ? '' : formatOfferAmountInput(parsed));
                    setAmountError(null);
                  }}
                  placeholder="Ej: 125.000"
                  value={amountInput}
                />
                <Spacer size="sm" />
              </>
            )}

            <AppText color="textMuted" variant="small">
              Al aceptar una oferta, confirmas el precio acordado para este servicio. Los pagos se
              gestionarán en una etapa posterior.
            </AppText>

            <Spacer size="md" />

            {mode === 'view' && !pendingOffer && (
              <Button
                disabled={isPending}
                label="Proponer oferta"
                onPress={() => setMode('propose')}
                variant="dark"
              />
            )}

            {mode === 'view' && isRecipient && pendingOffer ? (
              <>
                <Button
                  disabled={isPending}
                  label={acceptOffer.isPending ? 'Aceptando...' : 'Aceptar oferta'}
                  onPress={handleAccept}
                  variant="dark"
                />
                <Spacer size="sm" />
                <Button
                  disabled={isPending}
                  label="Contraofertar"
                  onPress={() => setMode('counter')}
                  variant="secondary"
                />
              </>
            ) : null}

            {mode === 'view' && isProposer && pendingOffer ? (
              <Button
                disabled={isPending}
                label={withdrawOffer.isPending ? 'Retirando...' : 'Retirar oferta'}
                onPress={handleWithdraw}
                variant="ghost"
              />
            ) : null}

            {mode === 'propose' ? (
              <>
                <Button
                  disabled={isPending}
                  label={createOffer.isPending ? 'Enviando...' : 'Enviar propuesta'}
                  onPress={handleCreateOffer}
                  variant="dark"
                />
                <Spacer size="sm" />
                <Button
                  disabled={isPending}
                  label="Cancelar"
                  onPress={() => {
                    setMode('view');
                    setAmountInput('');
                    setAmountError(null);
                  }}
                  variant="ghost"
                />
              </>
            ) : null}

            {mode === 'counter' ? (
              <>
                <Button
                  disabled={isPending}
                  label={counterOffer.isPending ? 'Enviando...' : 'Enviar contraoferta'}
                  onPress={handleCounterOffer}
                  variant="dark"
                />
                <Spacer size="sm" />
                <Button
                  disabled={isPending}
                  label="Cancelar"
                  onPress={() => {
                    setMode('view');
                    setAmountInput('');
                    setAmountError(null);
                  }}
                  variant="ghost"
                />
              </>
            ) : null}

            {mutationError ? (
              <>
                <Spacer size="sm" />
                <AppText color="destructive" variant="caption">
                  {mutationError}
                </AppText>
              </>
            ) : null}
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  header: {
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  serviceCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  offerBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
});
