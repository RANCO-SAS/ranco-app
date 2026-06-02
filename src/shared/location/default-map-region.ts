import type { LocationPoint, MapRegion } from '@/shared/location/location.types';

const DEFAULT_CENTER: LocationPoint = {
  lat: 4.711,
  lng: -74.072,
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function getDefaultMapRegion(point?: LocationPoint | null): MapRegion {
  const center = point ?? DEFAULT_CENTER;

  return {
    latitude: center.lat,
    longitude: center.lng,
    ...DEFAULT_DELTA,
  };
}

export function pointToMapRegion(point: LocationPoint, delta = DEFAULT_DELTA): MapRegion {
  return {
    latitude: point.lat,
    longitude: point.lng,
    ...delta,
  };
}
