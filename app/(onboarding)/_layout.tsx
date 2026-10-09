import { Redirect, Stack } from 'expo-router';

import { usePerfil } from '@/src/hooks/use-perfil';
import { useSesion } from '@/src/hooks/use-sesion';

export default function OnboardingLayout() {
  const { sesion } = useSesion();
  const perfilQuery = usePerfil();

  if (!sesion) {
    return <Redirect href="/(auth)/login" />;
  }

  if (perfilQuery.data?.onboarding_completado) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="preferencias-iniciales" />
    </Stack>
  );
}
