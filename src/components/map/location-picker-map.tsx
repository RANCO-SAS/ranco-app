import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUserLocation } from '@/hooks/use-user-location';
import { getMapRegion, type MapCoordinate } from '@/shared/utils/geo';

const DEFAULT_COORDINATE: MapCoordinate = {
  latitude: 40.4168,
  longitude: -3.7038,
};

type LocationPickerMapProps = {
  latitude: number | null;
  longitude: number | null;
  onCoordinateChange: (coordinate: MapCoordinate) => void;
  disabled?: boolean;
};

export function LocationPickerMap({
  latitude,
  longitude,
  onCoordinateChange,
  disabled = false,
}: LocationPickerMapProps) {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const { location, isLoading, permissionDenied, refresh } = useUserLocation();
  const [isReady, setIsReady] = useState(false);

  const initialCoordinate =
    latitude !== null && longitude !== null
      ? { latitude, longitude }
      : (location ?? DEFAULT_COORDINATE);

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      return;
    }

    const nextCoordinate = location ?? DEFAULT_COORDINATE;
    onCoordinateChange(nextCoordinate);
  }, [latitude, longitude, location, onCoordinateChange]);

  const handleRegionChangeComplete = (region: Region) => {
    if (disabled) {
      return;
    }

    onCoordinateChange({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  const handleUseMyLocation = async () => {
    const nextLocation = await refresh();

    if (!nextLocation) {
      return;
    }

    onCoordinateChange(nextLocation);
    mapRef.current?.animateToRegion(getMapRegion(nextLocation), 350);
  };

  return (
    <View style={[styles.container, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}>
      {isLoading && !isReady ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={theme.primary} />
          <AppText color="textSecondary" variant="caption">
            Obteniendo ubicación...
          </AppText>
        </View>
      ) : null}

      <MapView
        ref={mapRef}
        initialRegion={getMapRegion(initialCoordinate)}
        onMapReady={() => setIsReady(true)}
        onRegionChangeComplete={handleRegionChangeComplete}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={!disabled}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation
        style={styles.map}
        zoomEnabled={!disabled}
      />

      <View pointerEvents="none" style={styles.centerMarker}>
        <View style={[styles.pinHead, { backgroundColor: theme.primary }]} />
        <View style={[styles.pinTail, { backgroundColor: theme.primary }]} />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => {
          void handleUseMyLocation();
        }}
        style={[
          styles.locationButton,
          { backgroundColor: theme.background, borderColor: theme.border },
          disabled && styles.disabled,
        ]}>
        <AppText variant="small">📍 Usar mi ubicación</AppText>
      </Pressable>

      {permissionDenied ? (
        <View style={[styles.permissionBanner, { backgroundColor: theme.background }]}>
          <AppText color="textSecondary" variant="caption">
            Sin permiso de ubicación. Mueve el mapa para marcar el punto del trabajo.
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 260,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  map: StyleSheet.absoluteFill,
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    zIndex: 2,
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -34,
    alignItems: 'center',
    zIndex: 1,
  },
  pinHead: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  pinTail: {
    width: 2,
    height: 14,
    marginTop: -2,
  },
  locationButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    zIndex: 2,
  },
  permissionBanner: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    zIndex: 2,
  },
  disabled: {
    opacity: 0.6,
  },
});
