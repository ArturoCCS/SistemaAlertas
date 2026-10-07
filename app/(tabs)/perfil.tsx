import { StyleSheet, Text, View } from 'react-native';

import { usePermisosDispositivo } from '@/src/hooks/use-permisos-dispositivo';

export default function PerfilScreen() {
  const { estadoUbicacion, estadoNotificaciones } = usePermisosDispositivo();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Perfil</Text>
      <Text style={styles.linea}>Ubicación: {estadoUbicacion}</Text>
      <Text style={styles.linea}>Notificaciones: {estadoNotificaciones}</Text>
      <Text style={styles.nota}>
        Solo se conserva la última ubicación del usuario. Nunca se guarda historial.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
    backgroundColor: '#F8FAFC',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  linea: {
    color: '#334155',
  },
  nota: {
    marginTop: 8,
    color: '#475569',
  },
});
