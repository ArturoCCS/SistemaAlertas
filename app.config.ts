import type { ExpoConfig } from 'expo/config';

const googleMapsApiKeyRaw = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const googleMapsApiKey = googleMapsApiKeyRaw?.trim() ? googleMapsApiKeyRaw.trim() : undefined;

const config: ExpoConfig = {
  name: 'ALERTA CERCA',
  slug: 'sistema-alertas',
  owner: 'alfonso207',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'sistemaalertas',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.alfonso207.sistemaalertas',
    infoPlist: {
      UIBackgroundModes: ['location'],
    },
    ...(googleMapsApiKey
      ? {
          config: {
            googleMapsApiKey,
          },
        }
      : {}),
  },
  android: {
    package: 'com.alfonso207.sistemaalertas',
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
      backgroundColor: '#E6F4FE',
    },
    permissions: ['ACCESS_BACKGROUND_LOCATION'],
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
        locationAlwaysAndWhenInUsePermission:
          'ALERTA CERCA puede actualizar tu celda aproximada en segundo plano para avisarte de alertas cercanas, incluso con la app cerrada. Nunca se guarda tu historial de ubicación.',
        isAndroidBackgroundLocationEnabled: true,
        isIosBackgroundLocationEnabled: true,
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#1D4ED8',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'ALERTA CERCA necesita acceso a tus fotos para adjuntar evidencia opcional a un reporte.',
        cameraPermission:
          'ALERTA CERCA necesita la cámara para tomar una foto del incidente que estás reportando.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? 'd304c630-1b5f-4db6-8d42-841365088633',
    },
  },
};

export default config;
