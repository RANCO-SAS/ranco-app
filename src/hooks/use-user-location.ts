import { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { locationService } from '@/services/location/location.service';
import type { LocationAccessState } from '@/services/location/location.types';
import type { MapCoordinate } from '@/shared/utils/geo';
import { devLog } from '@/lib/dev-logger';

type UseUserLocationOptions = {
  enabled?: boolean;
  requestPermissionOnMount?: boolean;
};

type RefreshLocationOptions = {
  requestPermission?: boolean;
};

type UseUserLocationResult = {
  location: MapCoordinate | null;
  access: LocationAccessState;
  isLoading: boolean;
  refresh: (options?: RefreshLocationOptions) => Promise<MapCoordinate | null>;
  openSettings: () => Promise<void>;
};

const INITIAL_ACCESS: LocationAccessState = {
  issue: 'none',
  message: null,
  permissionStatus: 'undetermined' as LocationAccessState['permissionStatus'],
  servicesEnabled: true,
  canRequestPermission: true,
  canOpenSettings: false,
  isReady: false,
};

export function useUserLocation(options: UseUserLocationOptions = {}): UseUserLocationResult {
  const enabled = options.enabled ?? true;
  const requestPermissionOnMount = options.requestPermissionOnMount ?? true;
  const [location, setLocation] = useState<MapCoordinate | null>(null);
  const [access, setAccess] = useState<LocationAccessState>(INITIAL_ACCESS);
  const [isLoading, setIsLoading] = useState(enabled);

  const refresh = useCallback(
    async (refreshOptions: RefreshLocationOptions = {}): Promise<MapCoordinate | null> => {
      setIsLoading(true);

      try {
        const result = await locationService.resolveUserLocation({
          requestPermission: refreshOptions.requestPermission ?? false,
        });

        setAccess(result.access);
        setLocation(result.location);

        devLog('location', 'useUserLocation:refresh', {
          hasLocation: Boolean(result.location),
          issue: result.access.issue,
          servicesEnabled: result.access.servicesEnabled,
          permissionStatus: result.access.permissionStatus,
        });

        return result.location;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const openSettings = useCallback(async () => {
    await locationService.openLocationSettings();
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    void refresh({ requestPermission: requestPermissionOnMount });
  }, [enabled, refresh, requestPermissionOnMount]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void refresh({ requestPermission: false });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [enabled, refresh]);

  return {
    location,
    access,
    isLoading,
    refresh,
    openSettings,
  };
}
