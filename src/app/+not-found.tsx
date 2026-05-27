import { Link, Stack } from 'expo-router';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Section } from '@/components/layout/section';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Routes } from '@/constants/routes';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrado' }} />
      <ScreenLayout centered>
        <Section title="Pantalla no encontrada">
          <AppText variant="body" color="textSecondary" align="center">
            Verifica la URL o vuelve al inicio de la aplicación.
          </AppText>
          <Link href={Routes.root} asChild>
            <Button label="Ir al inicio" />
          </Link>
        </Section>
      </ScreenLayout>
    </>
  );
}
