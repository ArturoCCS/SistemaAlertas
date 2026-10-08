import type { ExpoConfig } from 'expo/config';

const googleMapsApiKeyRaw = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const googleMapsApiKey = googleMapsApiKeyRaw?.trim() ? googleMapsApiKeyRaw.trim() : undefined;

const config: ExpoConfig = {
  name: 'ALERTA CERCA',
  slug: 'sistema-alertas',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'sistemaalertas',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    ...(googleMapsApiKey
      ? {
          config: {
            googleMapsApiKey,
          },
        }
      : {}),
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
      backgroundColor: '#E6F4FE',
    },
    ...(googleMapsApiKey
      ? {
          config: {
            googleMaps: {
              apiKey: googleMapsApiKey,
            },
          },
        }
      : {}),
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0F172A',
        image: './assets/images/splash-icon.png',
        imageWidth: 96,
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'ALERTA CERCA usa tu ubicación para mostrar alertas cercanas y crear reportes comunitarios.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#1D4ED8',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
};

export default config;
