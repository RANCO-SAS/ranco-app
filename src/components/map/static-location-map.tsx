import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { baseMapProps, mapLayoutStyles } from '@/components/map/map-config';
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
    <View style={[styles.container, mapLayoutStyles.rounded, { borderColor: theme.border }]}>
      <MapView
        {...baseMapProps}
        initialRegion={getMapRegion(coordinate, 0.008)}
        scrollEnabled={false}
        style={[mapLayoutStyles.fill, mapLayoutStyles.rounded]}
        zoomEnabled={false}>
        <Marker coordinate={coordinate} title={title} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
