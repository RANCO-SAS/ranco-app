import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import type { MapCoordinate } from '@/shared/utils/geo';

type UseUserLocationOptions = {
  enabled?: boolean;
};

type UseUserLocationResult = {
  location: MapCoordinate | null;
  error: string | null;
  isLoading: boolean;
  permissionDenied: boolean;
  refresh: () => Promise<MapCoordinate | null>;
};

export function useUserLocation(options: UseUserLocationOptions = {}): UseUserLocationResult {
  const enabled = options.enabled ?? true;
  const [location, setLocation] = useState<MapCoordinate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const refresh = useCallback(async (): Promise<MapCoordinate | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setPermissionDenied(true);
        setError('Activa la ubicación para ver oportunidades cercanas.');
        return null;
      }

      setPermissionDenied(false);

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextLocation: MapCoordinate = {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      };

      setLocation(nextLocation);
      return nextLocation;
    } catch {
      setError('No pudimos obtener tu ubicación.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    void refresh();
  }, [enabled, refresh]);

  return {
    location,
    error,
    isLoading,
    permissionDenied,
    refresh,
  };
}
