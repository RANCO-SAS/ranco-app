import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import type { UserMode } from '@/types';

type ActiveModeBannerProps = {
  mode: UserMode;
};

const MODE_COPY: Record<
  UserMode,
  { title: string; description: string }
> = {
  client: {
    title: 'Estás en modo cliente',
    description: 'Aquí publicas solicitudes y gestionas tus trabajos. No verás oportunidades de otros.',
  },
  professional: {
    title: 'Estás en modo profesional',
    description: 'Aquí ves oportunidades de tu oficio. Para publicar solicitudes, cambia a modo cliente.',
  },
};

export function ActiveModeBanner({ mode }: ActiveModeBannerProps) {
  const copy = MODE_COPY[mode];

  return (
    <Card>
      <View style={styles.copy}>
        <AppText color="primary" variant="caption">
          {copy.title}
        </AppText>
        <AppText color="textSecondary" variant="caption">
          {copy.description}
        </AppText>
        <AppText color="textMuted" variant="small">
          Ve a Perfil → Modo de la app para cambiar entre cliente y profesional.
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: Spacing.xs,
  },
});
