import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { SERVICE_REQUEST_STATUS_LABELS } from '@/features/jobs/constants/service-request-labels';
import { useUpdateServiceRequestStatus } from '@/features/jobs/hooks/use-update-service-request-status';
import type { ServiceRequestStatus } from '@/features/jobs/types/service-request.types';

type JobEngagementPanelProps = {
  requestId: string;
  userId: string;
  clientId: string;
  professionalId: string;
  professionalName: string;
  status: ServiceRequestStatus;
  assignedProfessionalId: string | null;
  isClient: boolean;
};

type StatusAction = {
  label: string;
  nextStatus: ServiceRequestStatus;
  variant?: 'dark' | 'secondary' | 'ghost';
  requiresConfirmation?: boolean;
};

function getAvailableActions(props: JobEngagementPanelProps): StatusAction[] {
  if (
    props.assignedProfessionalId &&
    props.assignedProfessionalId !== props.professionalId &&
    props.status !== 'cancelled'
  ) {
    return props.isClient && props.status === 'in_negotiation'
      ? [{ label: 'Cancelar solicitud', nextStatus: 'cancelled', variant: 'ghost' }]
      : [];
  }

  if (props.isClient) {
    if (props.status === 'in_negotiation') {
      return [
        {
          label: `Aceptar a ${props.professionalName}`,
          nextStatus: 'accepted',
          variant: 'dark',
          requiresConfirmation: true,
        },
        { label: 'Cancelar solicitud', nextStatus: 'cancelled', variant: 'ghost' },
      ];
    }

    if (props.status === 'accepted' && props.assignedProfessionalId === props.professionalId) {
      return [{ label: 'Iniciar trabajo', nextStatus: 'in_progress', variant: 'dark' }];
    }

    if (props.status === 'in_progress' && props.assignedProfessionalId === props.professionalId) {
      return [{ label: 'Marcar completada', nextStatus: 'completed', variant: 'dark' }];
    }

    return [];
  }

  if (props.userId !== props.assignedProfessionalId) {
    return [];
  }

  if (props.status === 'accepted') {
    return [{ label: 'Iniciar trabajo', nextStatus: 'in_progress', variant: 'dark' }];
  }

  if (props.status === 'in_progress') {
    return [{ label: 'Marcar completada', nextStatus: 'completed', variant: 'dark' }];
  }

  return [];
}

function getStatusMessage(props: JobEngagementPanelProps): string | null {
  if (props.isClient) {
    if (
      props.assignedProfessionalId &&
      props.assignedProfessionalId !== props.professionalId &&
      props.status !== 'cancelled'
    ) {
      return 'Ya seleccionaste a otro profesional para esta solicitud.';
    }

    if (props.status === 'accepted' && props.assignedProfessionalId === props.professionalId) {
      return `${props.professionalName} fue aceptado. Puedes iniciar el trabajo cuando estén listos.`;
    }

    if (props.status === 'in_negotiation') {
      return `Estás evaluando a ${props.professionalName}. Al aceptarlo, no podrás elegir otro profesional.`;
    }

    return null;
  }

  if (
    props.assignedProfessionalId &&
    props.assignedProfessionalId !== props.professionalId &&
    props.status !== 'cancelled'
  ) {
    return 'El cliente seleccionó a otro profesional para este trabajo.';
  }

  if (props.status === 'in_negotiation') {
    return 'El cliente aún no te ha seleccionado para este trabajo.';
  }

  if (props.status === 'accepted' && props.userId === props.assignedProfessionalId) {
    return 'Fuiste aceptado. Inicia el trabajo cuando estés listo.';
  }

  if (props.status === 'in_progress' && props.userId === props.assignedProfessionalId) {
    return 'Trabajo en curso.';
  }

  if (props.status === 'completed') {
    return 'Trabajo completado.';
  }

  return null;
}

export function JobEngagementPanel(props: JobEngagementPanelProps) {
  const updateStatus = useUpdateServiceRequestStatus();
  const [pendingAction, setPendingAction] = useState<StatusAction | null>(null);
  const actions = getAvailableActions(props);
  const statusMessage = getStatusMessage(props);

  const handleAction = (action: StatusAction) => {
    if (action.requiresConfirmation && pendingAction?.nextStatus !== action.nextStatus) {
      setPendingAction(action);
      return;
    }

    updateStatus.mutate(
      {
        requestId: props.requestId,
        userId: props.userId,
        status: action.nextStatus,
        assignedProfessionalId:
          action.nextStatus === 'accepted' ? props.professionalId : undefined,
      },
      {
        onSettled: () => {
          setPendingAction(null);
        },
      },
    );
  };

  return (
    <Card>
      <AppText variant="bodyMedium">{SERVICE_REQUEST_STATUS_LABELS[props.status]}</AppText>
      {statusMessage ? (
        <>
          <Spacer size="sm" />
          <AppText color="textSecondary" variant="caption">
            {statusMessage}
          </AppText>
        </>
      ) : null}

      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((action) => {
            const isConfirming = pendingAction?.nextStatus === action.nextStatus;

            return (
              <View key={action.nextStatus} style={styles.actionBlock}>
                {isConfirming ? (
                  <>
                    <AppText variant="caption" color="textSecondary">
                      ¿Confirmas a {props.professionalName} para este trabajo?
                    </AppText>
                    <Spacer size="sm" />
                    <Button
                      disabled={updateStatus.isPending}
                      label={updateStatus.isPending ? 'Aceptando...' : 'Confirmar'}
                      onPress={() => handleAction(action)}
                      variant="dark"
                    />
                    <Spacer size="xs" />
                    <Button
                      disabled={updateStatus.isPending}
                      label="Cancelar"
                      onPress={() => setPendingAction(null)}
                      variant="ghost"
                    />
                  </>
                ) : (
                  <Button
                    disabled={updateStatus.isPending}
                    label={
                      updateStatus.isPending && action.nextStatus !== 'accepted'
                        ? 'Actualizando...'
                        : action.label
                    }
                    onPress={() => handleAction(action)}
                    variant={action.variant ?? 'secondary'}
                  />
                )}
              </View>
            );
          })}
        </View>
      ) : null}

      {updateStatus.error ? (
        <>
          <Spacer size="sm" />
          <AppText color="destructive" variant="caption">
            {updateStatus.error.message}
          </AppText>
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBlock: {
    gap: Spacing.xs,
  },
});
