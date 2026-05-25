import { Platform } from 'react-native';
import { PROVIDER_DEFAULT, PROVIDER_GOOGLE, type MapViewProps } from 'react-native-maps';

import { Radius } from '@/constants/theme';
import { devLog } from '@/lib/dev-logger';

export const MAP_PROVIDER =
  Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

devLog('map', 'map-config:init', {
  platform: Platform.OS,
  provider: MAP_PROVIDER === PROVIDER_GOOGLE ? 'google' : 'default',
});

export const DEFAULT_MAP_DELTA = 0.01;

export const baseMapProps: Pick<
  MapViewProps,
  | 'pitchEnabled'
  | 'rotateEnabled'
  | 'showsCompass'
  | 'showsMyLocationButton'
  | 'provider'
  | 'loadingEnabled'
  | 'moveOnMarkerPress'
> = {
  pitchEnabled: false,
  rotateEnabled: false,
  showsCompass: false,
  showsMyLocationButton: false,
  provider: MAP_PROVIDER,
  loadingEnabled: true,
  moveOnMarkerPress: false,
};

export const mapLayoutStyles = {
  fill: {
    width: '100%' as const,
    height: '100%' as const,
  },
  rounded: {
    borderRadius: Radius.lg,
  },
};
