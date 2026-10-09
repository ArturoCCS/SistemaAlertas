import { useMutation } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { registrarUsuario } from '@/src/services/auth';

export default function RegistroScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [requiereConfirmacion, setRequiereConfirmacion] = useState(false);

  const mutacion = useMutation({
    mutationFn: () =>
      registrarUsuario({ email: email.trim(), password, telefono: telefono.trim() || null }),
    onSuccess: (data) => {
      if (!data.session) {
        setRequiereConfirmacion(true);
      }
    },
  });

  if (requiereConfirmacion) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Revisa tu correo</Text>
        <Text style={styles.subtitulo}>
          Te enviamos un enlace de confirmación a {email.trim()}. Confírmalo y vuelve a iniciar
          sesión.
        </Text>
        <Link href="/(auth)/login" style={styles.enlace}>
          Ir a iniciar sesión
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear cuenta</Text>
      <Text style={styles.subtitulo}>
        Tu ubicación exacta nunca sale de tu teléfono: el servidor solo conoce una celda
        aproximada.
      </Text>

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
        placeholder="Contraseña (mínimo 6 caracteres)"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        autoComplete="new-password"
      />
      <TextInput
        value={telefono}
        onChangeText={setTelefono}
        style={styles.campo}
        placeholder="Teléfono (opcional)"
        placeholderTextColor="#94A3B8"
        keyboardType="phone-pad"
      />
      <Text style={styles.nota}>
        El teléfono es opcional en este prototipo; todavía no hay verificación por SMS.
      </Text>

      {mutacion.error ? <MensajeConfiguracion error={mutacion.error} /> : null}

      <Pressable
        onPress={() => mutacion.mutate()}
        style={styles.boton}
        disabled={mutacion.isPending || !email.trim() || password.length < 6}>
        {mutacion.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.botonTexto}>Registrarme</Text>
        )}
      </Pressable>

      <Link href="/(auth)/login" style={styles.enlace}>
        Ya tengo cuenta
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
  nota: {
    color: '#64748B',
    fontSize: 12,
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
