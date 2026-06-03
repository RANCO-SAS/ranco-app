import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type MapPressEvent } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapErrorBoundary } from '@/components/layout/map-error-boundary';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  getMapsNotConfiguredMessage,
  isGoogleMapsConfigured,
  shouldUseGoogleMapsProvider,
} from '@/lib/maps-config';
import { getDefaultMapRegion, pointToMapRegion } from '@/shared/location/default-map-region';
import type { LocationPoint, LocationSelection } from '@/shared/location/location.types';
import { reverseGeocodeLocationLabel } from '@/shared/location/reverse-geocode';

type LocationMapPickerModalProps = {
  visible: boolean;
  initialPoint?: LocationPoint | null;
  initialLabel?: string;
  onClose: () => void;
  onConfirm: (selection: LocationSelection) => void;
};

type LocationMapPickerContentProps = Omit<LocationMapPickerModalProps, 'visible'>;

function formatCoordinateFallback(point: LocationPoint): string {
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
}

function LocationMapPickerContent({
  initialPoint = null,
  initialLabel = '',
  onClose,
  onConfirm,
}: LocationMapPickerContentProps) {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const needsInitialGeocode = Boolean(initialPoint && !initialLabel.trim());
  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(initialPoint);
  const [previewLabel, setPreviewLabel] = useState(initialLabel.trim());
  const [isGeocoding, setIsGeocoding] = useState(needsInitialGeocode);
  const [isLocating, setIsLocating] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const initialRegion = getDefaultMapRegion(initialPoint);
  const mapProvider = shouldUseGoogleMapsProvider() ? PROVIDER_GOOGLE : undefined;

  useEffect(() => {
    let cancelled = false;

    void Location.getForegroundPermissionsAsync().then((permission) => {
      if (!cancelled && permission.status === Location.PermissionStatus.GRANTED) {
        setHasLocationPermission(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const resolveLabel = useCallback(async (point: LocationPoint) => {
    setIsGeocoding(true);

    try {
      const label = await reverseGeocodeLocationLabel(point);
      setPreviewLabel(label ?? formatCoordinateFallback(point));
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  useEffect(() => {
    if (!needsInitialGeocode || !initialPoint) {
      return;
    }

    let cancelled = false;

    reverseGeocodeLocationLabel(initialPoint)
      .then((label) => {
        if (cancelled) {
          return;
        }

        setPreviewLabel(label ?? formatCoordinateFallback(initialPoint));
      })
      .finally(() => {
        if (!cancelled) {
          setIsGeocoding(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialPoint, needsInitialGeocode]);

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const point: LocationPoint = { lat: latitude, lng: longitude };

    setSelectedPoint(point);
    mapRef.current?.animateToRegion(pointToMapRegion(point), 250);
    void resolveLabel(point);
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setPermissionError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setHasLocationPermission(false);
        setPermissionError('Activa el permiso de ubicación para usar tu posición actual.');
        return;
      }

      setHasLocationPermission(true);

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const point: LocationPoint = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setSelectedPoint(point);
      const region = pointToMapRegion(point);
      mapRef.current?.animateToRegion(region, 350);
      await resolveLabel(point);
    } catch {
      setPermissionError('No pudimos obtener tu ubicación. Selecciona un punto en el mapa.');
    } finally {
      setIsLocating(false);
    }
  };

  const canConfirm = Boolean(selectedPoint && previewLabel.trim().length > 0 && !isGeocoding);

  if (!isGoogleMapsConfigured()) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" hitSlop={12} onPress={onClose}>
            <AppText color="primary" variant="bodyMedium">
              Cerrar
            </AppText>
          </Pressable>
        </View>
        <View style={styles.unavailableWrap}>
          <AppText align="center" variant="subtitle">
            Mapa no disponible
          </AppText>
          <AppText align="center" color="textSecondary" variant="body">
            {getMapsNotConfiguredMessage()}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const handleConfirm = () => {
    if (!selectedPoint || !previewLabel.trim()) {
      return;
    }

    onConfirm({
      label: previewLabel.trim(),
      point: selectedPoint,
    });
    onClose();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={onClose}>
          <AppText color="primary" variant="bodyMedium">
            Cancelar
          </AppText>
        </Pressable>

        <AppText variant="bodyMedium">Seleccionar ubicación</AppText>

        <Pressable
          accessibilityRole="button"
          disabled={!canConfirm}
          hitSlop={12}
          onPress={handleConfirm}
          style={{ opacity: canConfirm ? 1 : 0.4 }}>
          <AppText color="primary" variant="bodyMedium">
            Confirmar
          </AppText>
        </Pressable>
      </View>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          initialRegion={initialRegion}
          onPress={handleMapPress}
          provider={mapProvider}
          showsCompass
          showsUserLocation={hasLocationPermission}
          style={styles.map}
        >
          {selectedPoint ? (
            <Marker
              coordinate={{
                latitude: selectedPoint.lat,
                longitude: selectedPoint.lng,
              }}
            />
          ) : null}
        </MapView>

        <AnimatedPressable
          accessibilityRole="button"
          disabled={isLocating}
          onPress={() => {
            void handleUseCurrentLocation();
          }}
          style={[
            styles.locateButton,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
              opacity: isLocating ? 0.6 : 1,
            },
          ]}>
          {isLocating ? (
            <ActivityIndicator color={theme.primary} size="small" />
          ) : (
            <AppIcon color={theme.primary} name="locate-outline" size={22} />
          )}
          <AppText variant="bodyMedium">Usar mi ubicación</AppText>
        </AnimatedPressable>
      </View>

      <View style={[styles.footer, { backgroundColor: theme.backgroundSecondary, borderTopColor: theme.border }]}>
        <AppText color="textSecondary" variant="label">
          Dirección detectada
        </AppText>

        {isGeocoding ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.primary} size="small" />
            <AppText color="textSecondary" variant="body">
              Obteniendo dirección...
            </AppText>
          </View>
        ) : (
          <AppText variant="body">
            {selectedPoint
              ? previewLabel || 'Toca el mapa para elegir un punto'
              : 'Toca el mapa para elegir un punto'}
          </AppText>
        )}

        {permissionError ? (
          <AppText color="destructive" variant="small">
            {permissionError}
          </AppText>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export function LocationMapPickerModal({
  visible,
  initialPoint = null,
  initialLabel = '',
  onClose,
  onConfirm,
}: LocationMapPickerModalProps) {
  const contentKey = [
    initialPoint?.lat ?? 'none',
    initialPoint?.lng ?? 'none',
    initialLabel.trim(),
  ].join('-');

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      {visible ? (
        <MapErrorBoundary onClose={onClose}>
          <LocationMapPickerContent
            key={contentKey}
            initialLabel={initialLabel}
            initialPoint={initialPoint}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        </MapErrorBoundary>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    minHeight: Layout.minTouchTarget,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mapWrap: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  locateButton: {
    position: 'absolute',
    top: Spacing.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: Layout.minTouchTarget,
  },
  footer: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unavailableWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
});
