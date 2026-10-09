import { useMutation } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { iniciarSesion } from '@/src/services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutacion = useMutation({
    mutationFn: () => iniciarSesion({ email: email.trim(), password }),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>ALERTA CERCA</Text>
      <Text style={styles.subtitulo}>Inicia sesión para reportar y recibir alertas cercanas.</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.campo}
        placeholder="Correo electrónico"
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.campo}
        placeholder="Contraseña"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        autoComplete="password"
      />

      {mutacion.error ? <MensajeConfiguracion error={mutacion.error} /> : null}

      <Pressable
        onPress={() => mutacion.mutate()}
        style={styles.boton}
        disabled={mutacion.isPending || !email.trim() || !password}>
        {mutacion.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.botonTexto}>Iniciar sesión</Text>
        )}
      </Pressable>

      <Link href="/(auth)/registro" style={styles.enlace}>
        ¿No tienes cuenta? Regístrate
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitulo: {
    color: '#334155',
    textAlign: 'center',
    marginBottom: 12,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
  },
  boton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  enlace: {
    textAlign: 'center',
    color: '#1D4ED8',
    marginTop: 12,
  },
});
