const appJson = require('./app.json');
const fs = require('fs');
const path = require('path');

const googleServicesPath = path.join(__dirname, 'google-services.json');
const hasGoogleServices = fs.existsSync(googleServicesPath);

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      ...(hasGoogleServices ? { googleServicesFile: './google-services.json' } : {}),
    },
    plugins: [
      ...(appJson.expo.plugins ?? []),
      [
        'expo-notifications',
        {
          icon: './assets/images/ranco-icon.png',
          color: '#208AEF',
        },
      ],
    ],
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
  },
};
