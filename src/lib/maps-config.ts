import Constants from 'expo-constants';
import { Platform } from 'react-native';

type MapsExtra = {
  googleMapsApiKeyAndroid?: string;
  googleMapsApiKeyIos?: string;
};

const MAPS_NOT_CONFIGURED_MESSAGE =
  'El mapa no está disponible en esta versión. Falta configurar la API de Google Maps en el build (EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID).';

function readExtra(): MapsExtra {
  return (Constants.expoConfig?.extra ?? {}) as MapsExtra;
}

function normalizeKey(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export function getGoogleMapsApiKey(): string | null {
  const extra = readExtra();

  if (Platform.OS === 'android') {
    return (
      normalizeKey(extra.googleMapsApiKeyAndroid) ??
      normalizeKey(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID)
    );
  }

  if (Platform.OS === 'ios') {
    return (
      normalizeKey(extra.googleMapsApiKeyIos) ??
      normalizeKey(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS)
    );
  }

  return null;
}

export function isGoogleMapsConfigured(): boolean {
  if (Platform.OS === 'web') {
    return true;
  }

  return getGoogleMapsApiKey() !== null;
}

export function getMapsNotConfiguredMessage(): string {
  return MAPS_NOT_CONFIGURED_MESSAGE;
}

export function shouldUseGoogleMapsProvider(): boolean {
  return Platform.OS === 'android' && isGoogleMapsConfigured();
}
