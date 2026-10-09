import Constants from 'expo-constants';

/**
 * true cuando la app corre dentro de la app genérica Expo Go, donde no están
 * disponibles módulos nativos de terceros (ni `expo-task-manager` en segundo
 * plano). Se usa para degradar con gracia en vez de tronar al importar.
 */
export const ejecutandoEnExpoGo = Constants.appOwnership === 'expo';
