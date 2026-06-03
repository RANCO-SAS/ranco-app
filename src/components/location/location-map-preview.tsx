import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { AppIcon } from '@/components/ui/app-icon';
import { Loader } from '@/components/ui/loader';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isGoogleMapsConfigured, shouldUseGoogleMapsProvider } from '@/lib/maps-config';
import { pointToMapRegion } from '@/shared/location/default-map-region';
import type { LocationPoint } from '@/shared/location/location.types';

type LocationMapPreviewProps = {
  point: LocationPoint | null;
  isLoading?: boolean;
  height?: number;
  emptyMessage?: string;
};

export function LocationMapPreview({
  point,
  isLoading = false,
  height = 140,
  emptyMessage = 'No se pudo ubicar en el mapa',
}: LocationMapPreviewProps) {
  const theme = useTheme();
  const canRenderMap = isGoogleMapsConfigured() && point;
  const mapProvider = shouldUseGoogleMapsProvider() ? PROVIDER_GOOGLE : undefined;

  return (
    <View
      style={[
        styles.mapPreview,
        {
          height,
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}>
      {isLoading ? (
        <Loader message="Ubicando en el mapa..." size="small" variant="inline" />
      ) : canRenderMap && point ? (
        <MapView
          key={`${point.lat}-${point.lng}`}
          initialRegion={pointToMapRegion(point, {
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          })}
          pointerEvents="none"
          provider={mapProvider}
          scrollEnabled={false}
          style={styles.map}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: point.lat,
              longitude: point.lng,
            }}
          />
        </MapView>
      ) : (
        <>
          <View style={[styles.mapGridLine, styles.mapGridHorizontal, { backgroundColor: theme.border }]} />
          <View style={[styles.mapGridLine, styles.mapGridVertical, { backgroundColor: theme.border }]} />
          <View style={[styles.pin, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <AppIcon color={theme.primary} name="location" size={18} />
          </View>
          <View style={[styles.mapHint, { backgroundColor: `${theme.background}DD` }]}>
            <AppText color="textSecondary" variant="small">
              {emptyMessage}
            </AppText>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapPreview: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  mapGridLine: {
    position: 'absolute',
    opacity: 0.45,
  },
  mapGridHorizontal: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    top: '50%',
  },
  mapGridVertical: {
    height: '100%',
    width: StyleSheet.hairlineWidth,
    left: '50%',
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHint: {
    position: 'absolute',
    bottom: Spacing.md,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
