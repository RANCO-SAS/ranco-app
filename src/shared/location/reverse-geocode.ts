import * as Location from 'expo-location';

import { formatLocationLabel } from '@/shared/location/format-location-label';
import type { LocationPoint } from '@/shared/location/location.types';

export async function reverseGeocodeLocationLabel(point: LocationPoint): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: point.lat,
      longitude: point.lng,
    });

    if (results.length === 0) {
      return null;
    }

    return formatLocationLabel(results[0]);
  } catch {
    return null;
  }
}
