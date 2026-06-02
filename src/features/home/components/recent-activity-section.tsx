import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Loader } from '@/components/ui/loader';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { RecentActivityItemRow } from '@/features/home/components/recent-activity-item';
import type { RecentActivityItem } from '@/features/home/types/dashboard.types';

type RecentActivitySectionProps = {
  items: RecentActivityItem[];
  isLoading?: boolean;
};

export function RecentActivitySection({ items, isLoading = false }: RecentActivitySectionProps) {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="bodyMedium">Actividad reciente</AppText>
        {items.length > 0 ? (
          <Pressable accessibilityRole="button" onPress={() => router.push(Routes.app.notifications)}>
            <AppText color="primary" variant="caption">
              Ver todo
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <Card padded={false} style={styles.card}>
        {isLoading ? (
          <View style={styles.stateWrap}>
            <Loader message="Cargando actividad..." size="small" variant="inline" />
          </View>
        ) : items.length > 0 ? (
          <View style={styles.list}>
            {items.map((item, index) => (
              <View key={item.id} style={styles.listItem}>
                <RecentActivityItemRow
                  icon={item.icon}
                  iconBackground={item.iconBackground}
                  iconColor={item.iconColor}
                  isLast={index === items.length - 1}
                  route={item.route}
                  subtitle={item.subtitle}
                  title={item.title}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.stateWrap}>
            <EmptyState
              description="Cuando recibas mensajes, reseñas o actualizaciones de trabajos, aparecerán aquí."
              title="Sin actividad reciente"
            />
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  card: {
    overflow: 'hidden',
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  listItem: {
    width: '100%',
  },
  stateWrap: {
    padding: Spacing.lg,
  },
});
