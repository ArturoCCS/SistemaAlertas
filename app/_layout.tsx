// Debe ser el primer import del árbol: parchea `document` antes de que
// cualquier módulo cargue `h3-js` (ver src/polyfills/h3-polyfill.ts).
import '@/src/polyfills/h3-polyfill';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useRegistroPush } from '@/src/hooks/use-registro-push';
import { useInicializarSesion, useSesion } from '@/src/hooks/use-sesion';
import { registrarTareaActualizarCelda } from '@/src/tasks/ubicacion-background-task';

function NavegacionRaiz() {
  const { cargando } = useSesion();
  useRegistroPush();

  useEffect(() => {
    // `expo-task-manager` no existe en Expo Go; esta función ya maneja ese
    // caso internamente sin tronar (ver src/tasks/ubicacion-background-task.ts).
    void registrarTareaActualizarCelda();
  }, []);

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  useInicializarSesion();

  return (
    <QueryClientProvider client={queryClient}>
      <NavegacionRaiz />
    </QueryClientProvider>
  );
}

const styles = {
  cargando: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#0F172A',
  },
};
