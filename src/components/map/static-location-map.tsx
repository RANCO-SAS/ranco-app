import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getMapRegion, toMapCoordinate } from '@/shared/utils/geo';

type StaticLocationMapProps = {
  latitude: number | null;
  longitude: number | null;
  title?: string;
};

export function StaticLocationMap({ latitude, longitude, title }: StaticLocationMapProps) {
  const theme = useTheme();
  const coordinate = toMapCoordinate(latitude, longitude);

  if (!coordinate) {
    return null;
  }

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <MapView
        initialRegion={getMapRegion(coordinate, 0.008)}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={false}
        zoomEnabled={false}
        style={styles.map}>
        <Marker coordinate={coordinate} title={title} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
