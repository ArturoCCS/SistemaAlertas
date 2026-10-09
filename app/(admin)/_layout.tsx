import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, Stack } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useEsModerador } from '@/src/hooks/use-perfil';
import { useSesion } from '@/src/hooks/use-sesion';

function BotonVolverALaApp() {
  return (
    <Pressable onPress={() => router.replace('/(tabs)')} style={{ paddingHorizontal: 8 }}>
      <Ionicons name="arrow-back" size={22} color="#1D4ED8" />
    </Pressable>
  );
}

export default function AdminLayout() {
  const { sesion } = useSesion();
  const { esModerador, cargando } = useEsModerador();

  if (!sesion) {
    return <Redirect href="/(auth)/login" />;
  }

  if (cargando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!esModerador) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerLeft: () => <BotonVolverALaApp />,
      }}>
      <Stack.Screen name="index" options={{ title: 'Moderación' }} />
      <Stack.Screen name="historial" options={{ title: 'Historial' }} />
    </Stack>
  );
}
