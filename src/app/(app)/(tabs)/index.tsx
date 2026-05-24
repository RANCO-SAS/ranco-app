import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { EmptyState } from '@/components/ui/empty-state';

export default function HomeScreen() {
  return (
    <ScreenLayout>
      <Section
        title="Inicio"
        description="Tu panel principal para solicitar y ofrecer servicios.">
        <EmptyState
          title="Bienvenido a Ranco"
          description="Aquí verás tus solicitudes activas, ofertas recientes y actividad cercana."
        />
      </Section>
    </ScreenLayout>
  );
}
