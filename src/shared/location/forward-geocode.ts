import * as Location from 'expo-location';

import type { LocationPoint } from '@/shared/location/location.types';

export async function geocodeLocationLabel(label: string): Promise<LocationPoint | null> {
  const trimmed = label.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const results = await Location.geocodeAsync(trimmed);

    if (results.length === 0) {
      return null;
    }

    const first = results[0];

    return {
      lat: first.latitude,
      lng: first.longitude,
    };
  } catch {
    return null;
  }
}
