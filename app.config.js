const appJson = require('./app.json');
const fs = require('fs');
const path = require('path');

const googleServicesPath = path.join(__dirname, 'google-services.json');
const easGoogleServicesPath = process.env.GOOGLE_SERVICES_JSON;
const resolvedGoogleServicesFile =
  easGoogleServicesPath && fs.existsSync(easGoogleServicesPath)
    ? easGoogleServicesPath
    : fs.existsSync(googleServicesPath)
      ? './google-services.json'
      : undefined;

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
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
      ...(appJson.expo.plugins ?? []),
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
          androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID ?? '',
          iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS ?? '',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '2e52e0f6-2310-4603-b5d9-8e1ce72440f3',
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
  },
};
