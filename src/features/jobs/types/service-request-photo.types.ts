export type ServiceRequestPhotoItem = {
  id: string;
  uri: string;
  isRemote: boolean;
};

export function createLocalPhotoItem(uri: string): ServiceRequestPhotoItem {
  return {
    id: `local-${uri}-${Date.now()}`,
    uri,
    isRemote: false,
  };
}

export function createRemotePhotoItem(uri: string): ServiceRequestPhotoItem {
  return {
    id: `remote-${uri}`,
    uri,
    isRemote: true,
  };
}

export function splitServiceRequestPhotos(photos: ServiceRequestPhotoItem[]): {
  keptPhotoUrls: string[];
  newPhotoUris: string[];
} {
  return {
    keptPhotoUrls: photos.filter((photo) => photo.isRemote).map((photo) => photo.uri),
    newPhotoUris: photos.filter((photo) => !photo.isRemote).map((photo) => photo.uri),
  };
}
