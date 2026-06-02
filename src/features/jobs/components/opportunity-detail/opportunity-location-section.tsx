import { StyleSheet, View } from 'react-native';

import { LocationMapPreview } from '@/components/location/location-map-preview';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useGeocodedLocation } from '@/hooks/use-geocoded-location';
import { resolveStoredLocationPoint } from '@/shared/location/resolve-stored-location-point';

type OpportunityLocationSectionProps = {
  locationLabel: string;
  locationLat?: number | null;
  locationLng?: number | null;
};

export function OpportunityLocationSection({
  locationLabel,
  locationLat,
  locationLng,
}: OpportunityLocationSectionProps) {
  const storedPoint = resolveStoredLocationPoint(locationLat, locationLng);
  const geocodeQuery = useGeocodedLocation(locationLabel, {
    enabled: !storedPoint,
  });
  const mapPoint = storedPoint ?? geocodeQuery.data ?? null;

  return (
    <View style={styles.wrapper}>
      <AppText color="textSecondary" variant="body">
        {locationLabel}
      </AppText>

      <LocationMapPreview
        isLoading={!storedPoint && geocodeQuery.isLoading}
        point={mapPoint}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.md,
  },
});
