import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacer } from '@/components/ui/spacer';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import type { UserMode } from '@/types';

type ModeGateEmptyStateProps = {
  requiredMode: UserMode;
};

const MODE_COPY: Record<
  UserMode,
  { title: string; description: string; actionLabel: string }
> = {
  client: {
    title: 'Estás en modo profesional',
    description: 'Cambia a modo cliente para ver y gestionar tus solicitudes de servicio.',
    actionLabel: 'Cambiar a modo cliente',
  },
  professional: {
    title: 'Estás en modo cliente',
    description: 'Cambia a modo profesional para explorar oportunidades cerca de ti.',
    actionLabel: 'Cambiar a modo profesional',
  },
};

export function ModeGateEmptyState({ requiredMode }: ModeGateEmptyStateProps) {
  const { switchMode } = useActiveMode();
  const copy = MODE_COPY[requiredMode];

  return (
    <>
      <EmptyState title={copy.title} description={copy.description} />
      <Spacer size="md" />
      <Button label={copy.actionLabel} onPress={() => switchMode(requiredMode)} />
    </>
  );
}
