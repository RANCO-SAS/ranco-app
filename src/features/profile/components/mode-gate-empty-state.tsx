import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacer } from '@/components/ui/spacer';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import type { UserMode } from '@/types';

type ModeGateEmptyStateProps = {
  requiredMode: UserMode;
};

const MODE_COPY: Record<UserMode, { title: string; actionLabel: string }> = {
  client: {
    title: 'Modo cliente requerido',
    actionLabel: 'Modo cliente',
  },
  professional: {
    title: 'Modo profesional requerido',
    actionLabel: 'Modo profesional',
  },
};

export function ModeGateEmptyState({ requiredMode }: ModeGateEmptyStateProps) {
  const { switchMode } = useActiveMode();
  const copy = MODE_COPY[requiredMode];

  return (
    <>
      <EmptyState title={copy.title} />
      <Spacer size="md" />
      <Button label={copy.actionLabel} onPress={() => switchMode(requiredMode)} />
    </>
  );
}
