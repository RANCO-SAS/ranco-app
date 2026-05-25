import type { PermissionStatus } from 'expo-location';

import type { MapCoordinate } from '@/shared/utils/geo';

export type LocationAccessIssue =
  | 'none'
  | 'permission_denied'
  | 'permission_blocked'
  | 'services_disabled'
  | 'position_unavailable';

export type LocationAccessState = {
  issue: LocationAccessIssue;
  message: string | null;
  permissionStatus: PermissionStatus;
  servicesEnabled: boolean;
  canRequestPermission: boolean;
  canOpenSettings: boolean;
  isReady: boolean;
};

export type ResolveUserLocationOptions = {
  requestPermission?: boolean;
};

export type ResolveUserLocationResult = {
  location: MapCoordinate | null;
  access: LocationAccessState;
};
