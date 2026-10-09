import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { usePerfil } from '@/src/hooks/use-perfil';
import { useSesion } from '@/src/hooks/use-sesion';

type NombreIcono = keyof typeof Ionicons.glyphMap;

function crearIcono(activo: NombreIcono, inactivo: NombreIcono) {
  function IconoTab({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) {
    return <Ionicons name={focused ? activo : inactivo} size={size} color={color} />;
  }

  IconoTab.displayName = `IconoTab(${activo})`;

  return IconoTab;
}

export default function TabsLayout() {
  const { sesion } = useSesion();
  const perfilQuery = usePerfil();

  if (!sesion) {
    return <Redirect href="/(auth)/login" />;
  }

  if (perfilQuery.data && !perfilQuery.data.onboarding_completado) {
    return <Redirect href="/(onboarding)/preferencias-iniciales" />;
  }

  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center', tabBarActiveTintColor: '#1D4ED8' }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: crearIcono('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="mapa"
        options={{ title: 'Mapa', tabBarIcon: crearIcono('map', 'map-outline') }}
      />
      <Tabs.Screen
        name="crear-reporte"
        options={{
          title: 'Reportar',
          tabBarIcon: crearIcono('add-circle', 'add-circle-outline'),
        }}
      />
      <Tabs.Screen
        name="mis-reportes"
        options={{
          title: 'Mis reportes',
          tabBarIcon: crearIcono('document-text', 'document-text-outline'),
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{ title: 'Ajustes', tabBarIcon: crearIcono('settings', 'settings-outline') }}
      />
    </Tabs>
  );
}
