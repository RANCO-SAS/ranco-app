import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { baseMapProps, mapLayoutStyles } from '@/components/map/map-config';
import { getMapRegion, getRegionForCoordinates, type MapCoordinate } from '@/shared/utils/geo';
import { devLog } from '@/lib/dev-logger';

export type JobMapMarker = {
  id: string;
  coordinate: MapCoordinate;
  title: string;
  selected?: boolean;
};

export type JobMapViewHandle = {
  centerOnUser: () => void;
  centerOnMarkers: () => void;
};

type JobMapViewProps = {
  markers: JobMapMarker[];
  selectedId?: string | null;
  userLocation?: MapCoordinate | null;
  showUserLocation?: boolean;
  onMarkerPress?: (id: string) => void;
  onRegionChange?: (region: Region) => void;
};

export const JobMapView = forwardRef<JobMapViewHandle, JobMapViewProps>(function JobMapView(
  {
    markers,
    selectedId,
    userLocation,
    showUserLocation = false,
    onMarkerPress,
    onRegionChange,
  },
  ref,
) {
  const mapRef = useRef<MapView>(null);

  const centerOnUser = () => {
    if (!userLocation) {
      return;
    }

    mapRef.current?.animateToRegion(getMapRegion(userLocation, 0.02), 350);
  };

  const centerOnMarkers = () => {
    const coordinates = markers.map((marker) => marker.coordinate);

    if (userLocation) {
      coordinates.push(userLocation);
    }

    const nextRegion = getRegionForCoordinates(coordinates);

    if (nextRegion) {
      mapRef.current?.animateToRegion(nextRegion, 350);
    }
  };

  useImperativeHandle(ref, () => ({
    centerOnUser,
    centerOnMarkers,
  }));

  useEffect(() => {
    if (selectedId) {
      const selectedMarker = markers.find((marker) => marker.id === selectedId);

      if (selectedMarker) {
        mapRef.current?.animateToRegion(getMapRegion(selectedMarker.coordinate, 0.015), 350);
      }

      return;
    }

    centerOnMarkers();
  }, [markers, selectedId, userLocation]);

  const initialRegion =
    getRegionForCoordinates(
      userLocation ? [userLocation, ...markers.map((marker) => marker.coordinate)] : markers.map((marker) => marker.coordinate),
    ) ?? getMapRegion(userLocation ?? markers[0]?.coordinate ?? { latitude: 40.4168, longitude: -3.7038 });

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        devLog('map', 'discover:container-layout', {
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
          x: event.nativeEvent.layout.x,
          y: event.nativeEvent.layout.y,
        });
      }}>
      <MapView
        ref={mapRef}
        {...baseMapProps}
        initialRegion={initialRegion}
        onMapReady={() => {
          devLog('map', 'discover:onMapReady', {
            markerCount: markers.length,
            hasUserLocation: Boolean(userLocation),
            initialRegion,
          });
        }}
        onRegionChangeComplete={onRegionChange}
        scrollEnabled
        showsUserLocation={showUserLocation && Boolean(userLocation)}
        style={styles.map}
        userInterfaceStyle="light"
        zoomEnabled>
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            identifier={marker.id}
            onPress={() => onMarkerPress?.(marker.id)}
            pinColor={marker.selected || marker.id === selectedId ? '#11181C' : '#2563EB'}
            title={marker.title}
          />
        ))}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
