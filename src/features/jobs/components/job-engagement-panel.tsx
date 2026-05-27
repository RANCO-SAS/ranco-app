import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  status: ServiceRequestStatus;
  assignedProfessionalId: string | null;
  isClient: boolean;
};

type StatusAction = {
  label: string;
  nextStatus: ServiceRequestStatus;
  variant?: 'dark' | 'secondary' | 'ghost';
};

function getAvailableActions(props: JobEngagementPanelProps): StatusAction[] {
  if (props.isClient) {
    if (props.status === 'in_negotiation') {
      return [
        {
          label: 'Aceptar profesional',
          nextStatus: 'accepted',
          variant: 'dark',
        },
        { label: 'Cancelar solicitud', nextStatus: 'cancelled', variant: 'ghost' },
      ];
    }

    if (props.status === 'accepted') {
      return [{ label: 'Iniciar trabajo', nextStatus: 'in_progress', variant: 'dark' }];
    }

    if (props.status === 'in_progress') {
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

export function JobEngagementPanel(props: JobEngagementPanelProps) {
  const updateStatus = useUpdateServiceRequestStatus();
  const actions = getAvailableActions(props);

  return (
    <Card>
      <AppText variant="bodyMedium">{SERVICE_REQUEST_STATUS_LABELS[props.status]}</AppText>
      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((action) => (
            <Button
              key={action.nextStatus}
              disabled={updateStatus.isPending}
              label={updateStatus.isPending ? 'Actualizando...' : action.label}
              onPress={() => {
                updateStatus.mutate({
                  requestId: props.requestId,
                  userId: props.userId,
                  status: action.nextStatus,
                  assignedProfessionalId:
                    action.nextStatus === 'accepted' ? props.professionalId : undefined,
                });
              }}
              variant={action.variant ?? 'secondary'}
            />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function Spacer() {
  return <View style={{ height: Spacing.xs }} />;
}

const styles = StyleSheet.create({
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
