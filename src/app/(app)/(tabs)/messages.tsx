import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { EmptyState } from '@/components/ui/empty-state';

export default function MessagesScreen() {
  return (
    <ScreenLayout>
      <Section
        title="Mensajes"
        description="Conversaciones con clientes y profesionales.">
        <EmptyState
          title="Bandeja vacía"
          description="Cuando inicies una negociación, tus chats aparecerán aquí."
        />
      </Section>
    </ScreenLayout>
  );
}
