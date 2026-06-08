const appJson = require('./app.json');
const fs = require('fs');
const path = require('path');

const SPLASH_BACKGROUND_LIGHT = '#F1F5F9';
const SPLASH_BACKGROUND_DARK = '#000000';

const googleServicesPath = path.join(__dirname, 'google-services.json');
const easGoogleServicesPath = process.env.GOOGLE_SERVICES_JSON;
const resolvedGoogleServicesFile =
  easGoogleServicesPath && fs.existsSync(easGoogleServicesPath)
    ? easGoogleServicesPath
    : fs.existsSync(googleServicesPath)
      ? './google-services.json'
      : undefined;

const basePlugins = (appJson.expo.plugins ?? []).filter((plugin) => {
  if (Array.isArray(plugin) && plugin[0] === 'expo-splash-screen') {
    return false;
  }

  return plugin !== 'expo-splash-screen';
});

const googleMapsApiKeyAndroid = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID ?? '';
const googleMapsApiKeyIos = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS ?? '';

const easProjectId = 'e2e47456-4bb1-43cf-8d29-fe2e229368d2';

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: `https://u.expo.dev/${easProjectId}`,
    },
    android: {
      ...appJson.expo.android,
      edgeToEdgeEnabled: true,
      permissions: [
        ...(appJson.expo.android?.permissions ?? []),
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
      ],
      ...(resolvedGoogleServicesFile
        ? { googleServicesFile: resolvedGoogleServicesFile }
        : {}),
    },
    ios: {
      ...appJson.expo.ios,
      infoPlist: {
        ...appJson.expo.ios?.infoPlist,
        NSLocationWhenInUseUsageDescription:
          'Ranco usa tu ubicación para mostrarte en el mapa y autocompletar la dirección del servicio.',
      },
    },
    plugins: [
      ...basePlugins,
      [
        'expo-splash-screen',
        {
          backgroundColor: SPLASH_BACKGROUND_LIGHT,
          // Android requires splashscreen_logo drawables; transparent image keeps color-only UX.
          image: './assets/images/splash-transparent.png',
          imageWidth: 1,
          dark: {
            backgroundColor: SPLASH_BACKGROUND_DARK,
            image: './assets/images/splash-transparent.png',
          },
        },
      ],
      'expo-system-ui',
      [
        'expo-notifications',
        {
          icon: './assets/images/ranco-icon.png',
          color: '#208AEF',
        },
      ],
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Ranco usa tu ubicación para mostrarte en el mapa y autocompletar la dirección del servicio.',
        },
      ],
      [
        'react-native-maps',
        {
          androidGoogleMapsApiKey: googleMapsApiKeyAndroid,
          iosGoogleMapsApiKey: googleMapsApiKeyIos,
        },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: 'e2e47456-4bb1-43cf-8d29-fe2e229368d2',
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080',
      wsUrl: process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:8080',
      googleMapsApiKeyAndroid,
      googleMapsApiKeyIos,
    },
  },
};
