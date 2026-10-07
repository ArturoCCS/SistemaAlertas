import { StyleSheet, Text, View } from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { useReportesPublicos } from '@/src/hooks/use-reportes';

export default function MapaWebScreen() {
  const reportesQuery = useReportesPublicos();
  const marcadores = reportesQuery.data ?? [];

  return (
    <View style={styles.container}>
      {reportesQuery.error ? <MensajeConfiguracion error={reportesQuery.error} /> : null}
      <Text style={styles.leyenda}>
        En web, esta versión muestra solo listado. El mapa nativo usa react-native-maps en iOS y
        Android.
      </Text>
      {marcadores.map((reporte) => (
        <View key={reporte.id} style={styles.tarjeta}>
          <Text style={styles.tituloTarjeta}>{reporte.categoria_nombre}</Text>
          <Text style={styles.subtituloTarjeta}>{reporte.estado}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
    gap: 10,
  },
  leyenda: {
    color: '#334155',
    textAlign: 'center',
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  tituloTarjeta: {
    fontWeight: '600',
    color: '#0F172A',
  },
  subtituloTarjeta: {
    color: '#334155',
  },
});
