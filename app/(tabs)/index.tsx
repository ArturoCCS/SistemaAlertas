import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { useCategorias } from '@/src/hooks/use-categorias';

export default function InicioScreen() {
  const categoriasQuery = useCategorias();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>ALERTA CERCA</Text>
      <Text style={styles.subtitulo}>Alertamiento comunitario por proximidad</Text>

      <View style={[styles.estado, styles.estadoNoConfirmada]}>
        <Text style={styles.estadoTitulo}>Reporte ciudadano sin confirmar</Text>
        <Text style={styles.estadoTexto}>
          Publicación inicial; solo llega dentro del radio inicial de su categoría.
        </Text>
      </View>

      <View style={[styles.estado, styles.estadoCorroborada]}>
        <Text style={styles.estadoTitulo}>Varios reportes (corroborada)</Text>
        <Text style={styles.estadoTexto}>
          Tres o más reportes independientes coinciden: puede pasar al segundo anillo.
        </Text>
      </View>

      <View style={[styles.estado, styles.estadoVerificada]}>
        <Text style={styles.estadoTitulo}>Alerta verificada</Text>
        <Text style={styles.estadoTexto}>Confirmada por un moderador o autoridad.</Text>
      </View>

      {categoriasQuery.error ? (
        <MensajeConfiguracion error={categoriasQuery.error} />
      ) : (
        <Text style={styles.info}>
          Categorías activas:{' '}
          {categoriasQuery.data && categoriasQuery.data.length > 0
            ? String(categoriasQuery.data.length)
            : 'Sin datos'}
        </Text>
      )}

      <View style={styles.links}>
        <Link href="/(tabs)/mapa">Ir al mapa</Link>
        <Link href="/(tabs)/crear-reporte">Crear reporte</Link>
        <Link href="/(tabs)/mis-reportes">Ver mis reportes</Link>
        <Link href="/(tabs)/ajustes">Abrir ajustes</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 20,
    gap: 12,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitulo: {
    color: '#334155',
  },
  estado: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  estadoNoConfirmada: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D97706',
  },
  estadoCorroborada: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  estadoVerificada: {
    backgroundColor: '#ECFDF5',
    borderColor: '#047857',
  },
  estadoTitulo: {
    fontWeight: '700',
    color: '#0F172A',
  },
  estadoTexto: {
    color: '#334155',
  },
  info: {
    color: '#1E293B',
  },
  links: {
    marginTop: 8,
    gap: 8,
  },
});
