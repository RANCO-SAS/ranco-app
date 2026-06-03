import type { LocationGeocodedAddress } from 'expo-location';

const MAX_LABEL_LENGTH = 120;

function uniqueParts(parts: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();

  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter((part) => {
      const key = part.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

export function formatLocationLabel(address: LocationGeocodedAddress): string {
  const parts = uniqueParts([
    address.streetNumber ? `${address.street} ${address.streetNumber}` : address.street,
    address.district,
    address.subregion,
    address.city,
    address.region,
  ]);

  if (parts.length === 0 && address.name) {
    return address.name.slice(0, MAX_LABEL_LENGTH);
  }

  const label = parts.join(', ');
  return label.slice(0, MAX_LABEL_LENGTH);
}
