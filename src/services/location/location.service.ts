import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

import { devError, devLog, devWarn } from '@/lib/dev-logger';
import type {
  LocationAccessIssue,
  LocationAccessState,
  ResolveUserLocationOptions,
  ResolveUserLocationResult,
} from '@/services/location/location.types';
import type { MapCoordinate } from '@/shared/utils/geo';

function buildAccessState(input: {
  issue: LocationAccessIssue;
  permissionStatus: Location.PermissionStatus;
  servicesEnabled: boolean;
  canAskAgain: boolean;
}): LocationAccessState {
  const { issue, permissionStatus, servicesEnabled, canAskAgain } = input;

  if (issue === 'none') {
    return {
      issue,
      message: null,
      permissionStatus,
      servicesEnabled,
      canRequestPermission: false,
      canOpenSettings: false,
      isReady: true,
    };
  }

  if (issue === 'permission_blocked') {
    return {
      issue,
      message: 'Permiso de ubicación bloqueado. Ábrelo en Ajustes del teléfono.',
      permissionStatus,
      servicesEnabled,
      canRequestPermission: false,
      canOpenSettings: true,
      isReady: true,
    };
  }

  if (issue === 'permission_denied') {
    return {
      issue,
      message: 'Ranco necesita permiso de ubicación para usar tu posición en el mapa.',
      permissionStatus,
      servicesEnabled,
      canRequestPermission:
        canAskAgain || permissionStatus === Location.PermissionStatus.UNDETERMINED,
      canOpenSettings: true,
      isReady: true,
    };
  }

  if (issue === 'services_disabled') {
    return {
      issue,
      message:
        Platform.OS === 'android'
          ? 'La ubicación del teléfono está desactivada. Activa el GPS en Ajustes.'
          : 'Los servicios de ubicación están desactivados. Actívalos en Ajustes.',
      permissionStatus,
      servicesEnabled,
      canRequestPermission: false,
      canOpenSettings: true,
      isReady: true,
    };
  }

  return {
    issue,
    message: 'No pudimos obtener tu posición. Puedes seguir usando el mapa manualmente.',
    permissionStatus,
    servicesEnabled,
    canRequestPermission: permissionStatus === Location.PermissionStatus.GRANTED,
    canOpenSettings: true,
    isReady: true,
  };
}

async function assessLocationAccess(
  options: ResolveUserLocationOptions = {},
): Promise<LocationAccessState> {
  const requestPermission = options.requestPermission ?? false;

  devLog('location', 'assessLocationAccess:start', {
    requestPermission,
    platform: Platform.OS,
  });

  const servicesEnabled = await Location.hasServicesEnabledAsync();
  let permission = await Location.getForegroundPermissionsAsync();

  devLog('location', 'assessLocationAccess:initial', {
    servicesEnabled,
    permissionStatus: permission.status,
    canAskAgain: permission.canAskAgain,
  });

  if (requestPermission && permission.status === Location.PermissionStatus.UNDETERMINED) {
    permission = await Location.requestForegroundPermissionsAsync();
    devLog('location', 'assessLocationAccess:requested-permission', {
      permissionStatus: permission.status,
      canAskAgain: permission.canAskAgain,
    });
  }

  if (permission.status !== Location.PermissionStatus.GRANTED) {
    const issue: LocationAccessIssue =
      permission.canAskAgain === false ? 'permission_blocked' : 'permission_denied';

    const access = buildAccessState({
      issue,
      permissionStatus: permission.status,
      servicesEnabled,
      canAskAgain: permission.canAskAgain,
    });

    devWarn('location', 'assessLocationAccess:permission-not-granted', access);
    return access;
  }

  if (!servicesEnabled) {
    const access = buildAccessState({
      issue: 'services_disabled',
      permissionStatus: permission.status,
      servicesEnabled,
      canAskAgain: permission.canAskAgain,
    });

    devWarn('location', 'assessLocationAccess:services-disabled', access);
    return access;
  }

  const access = buildAccessState({
    issue: 'none',
    permissionStatus: permission.status,
    servicesEnabled,
    canAskAgain: permission.canAskAgain,
  });

  devLog('location', 'assessLocationAccess:ready', access);
  return access;
}

async function resolveUserLocation(
  options: ResolveUserLocationOptions = {},
): Promise<ResolveUserLocationResult> {
  devLog('location', 'resolveUserLocation:start', options);

  const access = await assessLocationAccess(options);

  if (access.issue !== 'none') {
    devWarn('location', 'resolveUserLocation:skipped-position', { issue: access.issue });
    return {
      location: null,
      access,
    };
  }

  try {
    const currentPosition = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const location: MapCoordinate = {
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude,
    };

    devLog('location', 'resolveUserLocation:success', {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: currentPosition.coords.accuracy,
    });

    return {
      location,
      access,
    };
  } catch (error) {
    devError('location', 'resolveUserLocation:getCurrentPosition-failed', error);

    return {
      location: null,
      access: buildAccessState({
        issue: 'position_unavailable',
        permissionStatus: access.permissionStatus,
        servicesEnabled: access.servicesEnabled,
        canAskAgain: true,
      }),
    };
  }
}

async function openLocationSettings(): Promise<void> {
  devLog('location', 'openLocationSettings');
  await Linking.openSettings();
}

export const locationService = {
  assessLocationAccess,
  resolveUserLocation,
  openLocationSettings,
};
