import { StyleSheet, Text, View } from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { useMisReportes } from '@/src/hooks/use-reportes';

export default function MisReportesScreen() {
  const misReportesQuery = useMisReportes();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis reportes</Text>
      {misReportesQuery.error ? <MensajeConfiguracion error={misReportesQuery.error} /> : null}
      {misReportesQuery.data?.length ? (
        misReportesQuery.data.map((reporte) => (
          <View key={reporte.id} style={styles.tarjeta}>
            <Text style={styles.nombre}>{reporte.categoria_id}</Text>
            <Text style={styles.estado}>{reporte.estado}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.vacio}>Aún no hay reportes para mostrar.</Text>
      )}
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
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  nombre: {
    fontWeight: '600',
    color: '#0F172A',
  },
  estado: {
    color: '#334155',
  },
  vacio: {
    color: '#475569',
  },
});
