import { Redirect, Stack } from 'expo-router';

import { useSesion } from '@/src/hooks/use-sesion';

export default function AuthLayout() {
  const { sesion } = useSesion();

  if (sesion) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="registro" />
    </Stack>
  );
}
