import type { LocationPoint } from '@/shared/location/location.types';

export function resolveStoredLocationPoint(
  lat: number | null | undefined,
  lng: number | null | undefined,
): LocationPoint | null {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
}
