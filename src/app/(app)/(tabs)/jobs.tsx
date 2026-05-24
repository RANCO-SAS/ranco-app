import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { EmptyState } from '@/components/ui/empty-state';

export default function JobsScreen() {
  return (
    <ScreenLayout>
      <Section
        title="Trabajos"
        description="Gestiona solicitudes, ofertas y trabajos en curso.">
        <EmptyState
          title="No hay trabajos activos"
          description="Tus solicitudes publicadas y trabajos aceptados se mostrarán en esta sección."
        />
      </Section>
    </ScreenLayout>
  );
}
