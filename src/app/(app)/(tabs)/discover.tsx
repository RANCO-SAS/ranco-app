import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { EmptyState } from '@/components/ui/empty-state';

export default function DiscoverScreen() {
  return (
    <ScreenLayout>
      <Section
        title="Explorar"
        description="Descubre oportunidades y profesionales cerca de ti.">
        <EmptyState
          title="Sin resultados por ahora"
          description="Cuando haya solicitudes o profesionales disponibles, aparecerán aquí."
        />
      </Section>
    </ScreenLayout>
  );
}
