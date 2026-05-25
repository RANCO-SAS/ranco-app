import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';

import { baseMapProps, DEFAULT_MAP_DELTA, mapLayoutStyles } from '@/components/map/map-config';
import { LocationStatusBanner } from '@/components/map/location-status-banner';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { devLog, devWarn } from '@/lib/dev-logger';
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
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  disabled?: boolean;
};

export function LocationPickerMap({
  latitude,
  longitude,
  onCoordinateChange,
  onInteractionStart,
  onInteractionEnd,
  disabled = false,
}: LocationPickerMapProps) {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const hasCenteredOnGpsRef = useRef(false);
  const { location, access, isLoading, refresh, openSettings } = useUserLocation({
    requestPermissionOnMount: false,
  });
  const [isMapReady, setIsMapReady] = useState(false);

  const pinnedCoordinate: MapCoordinate =
    latitude !== null && longitude !== null
      ? { latitude, longitude }
      : DEFAULT_COORDINATE;

  const syncCoordinate = useCallback(
    (coordinate: MapCoordinate) => {
      onCoordinateChange(coordinate);
    },
    [onCoordinateChange],
  );

  useEffect(() => {
    syncCoordinate(pinnedCoordinate);
  }, [pinnedCoordinate.latitude, pinnedCoordinate.longitude, syncCoordinate]);

  useEffect(() => {
    if (!location || hasCenteredOnGpsRef.current) {
      return;
    }

    hasCenteredOnGpsRef.current = true;
    const nextRegion = getMapRegion(location, DEFAULT_MAP_DELTA);
    syncCoordinate(location);
    mapRef.current?.animateToRegion(nextRegion, 350);
  }, [location, syncCoordinate]);

  const handleRegionChangeComplete = (nextRegion: Region) => {
    if (disabled) {
      return;
    }

    devLog('map', 'picker:region-change', {
      latitude: nextRegion.latitude,
      longitude: nextRegion.longitude,
      latitudeDelta: nextRegion.latitudeDelta,
      longitudeDelta: nextRegion.longitudeDelta,
    });

    syncCoordinate({
      latitude: nextRegion.latitude,
      longitude: nextRegion.longitude,
    });
    onInteractionEnd?.();
  };

  const handleUseMyLocation = async () => {
    devLog('map', 'picker:use-my-location:pressed');
    const nextLocation = await refresh({ requestPermission: true });

    if (!nextLocation) {
      devWarn('map', 'picker:use-my-location:failed');
      return;
    }

    devLog('map', 'picker:use-my-location:success', nextLocation);

    const nextRegion = getMapRegion(nextLocation, DEFAULT_MAP_DELTA);
    syncCoordinate(nextLocation);
    mapRef.current?.animateToRegion(nextRegion, 350);
  };

  const canShowUserLocation = access.issue === 'none' && Boolean(location);
  const showMapLoading = !isMapReady;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          mapLayoutStyles.rounded,
          { borderColor: theme.border, backgroundColor: theme.backgroundSecondary },
        ]}>
        <View
          style={styles.mapWrapper}
          onLayout={(event) => {
            devLog('map', 'picker:container-layout', {
              width: event.nativeEvent.layout.width,
              height: event.nativeEvent.layout.height,
              x: event.nativeEvent.layout.x,
              y: event.nativeEvent.layout.y,
            });
          }}>
          <MapView
            ref={mapRef}
            {...baseMapProps}
            initialRegion={getMapRegion(pinnedCoordinate, DEFAULT_MAP_DELTA)}
            onMapReady={() => {
              devLog('map', 'picker:onMapReady', {
                provider: baseMapProps.provider === undefined ? 'default' : String(baseMapProps.provider),
                initialRegion: getMapRegion(pinnedCoordinate, DEFAULT_MAP_DELTA),
              });
              setIsMapReady(true);
            }}
            onPanDrag={() => {
              onInteractionStart?.();
            }}
            onRegionChangeComplete={handleRegionChangeComplete}
            onTouchStart={() => {
              onInteractionStart?.();
            }}
            onTouchEnd={() => {
              onInteractionEnd?.();
            }}
            scrollEnabled={!disabled}
            showsUserLocation={canShowUserLocation}
            style={[mapLayoutStyles.fill, mapLayoutStyles.rounded]}
            zoomEnabled={!disabled}
          />

          {showMapLoading ? (
            <View pointerEvents="none" style={styles.loadingOverlay}>
              <ActivityIndicator color={theme.primary} />
              <AppText color="textSecondary" variant="caption">
                Cargando mapa...
              </AppText>
            </View>
          ) : null}
        </View>

        <View pointerEvents="none" style={styles.centerMarker}>
          <View style={[styles.pinHead, { backgroundColor: theme.primary }]} />
          <View style={[styles.pinTail, { backgroundColor: theme.primary }]} />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={disabled || isLoading}
          onPress={() => {
            void handleUseMyLocation();
          }}
          style={[
            styles.locationButton,
            { backgroundColor: theme.background, borderColor: theme.border },
            (disabled || isLoading) && styles.disabled,
          ]}>
          <AppText variant="small">
            {isLoading ? 'Buscando GPS...' : '📍 Usar mi ubicación'}
          </AppText>
        </Pressable>
      </View>

      <LocationStatusBanner
        access={access}
        compact
        fallbackMessage="Mueve el mapa para marcar dónde se hará el trabajo."
        onOpenSettings={() => {
          void openSettings();
        }}
        onRequestPermission={() => {
          void refresh({ requestPermission: true });
        }}
      />

      <AppText color="textMuted" variant="small">
        Pin en el centro: arrastra el mapa o usa tu ubicación para marcar el punto exacto.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  container: {
    height: 280,
    borderWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  mapWrapper: {
    height: '100%',
    width: '100%',
    borderRadius: Radius.lg,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -34,
    alignItems: 'center',
    zIndex: 2,
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
    zIndex: 3,
  },
  disabled: {
    opacity: 0.6,
  },
});
