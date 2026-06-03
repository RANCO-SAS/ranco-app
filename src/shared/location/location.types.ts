export type LocationPoint = {
  lat: number;
  lng: number;
};

export type LocationSelection = {
  label: string;
  point: LocationPoint;
};

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
