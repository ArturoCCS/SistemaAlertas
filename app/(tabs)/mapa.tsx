import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { useReportesPublicos } from '@/src/hooks/use-reportes';

export default function MapaScreen() {
  const reportesQuery = useReportesPublicos();
  const marcadores = useMemo(() => reportesQuery.data ?? [], [reportesQuery.data]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapa}
        initialRegion={{
          latitude: 19.4333,
          longitude: -102.05,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        }}>
        {marcadores.map((reporte) => (
          <Marker
            key={reporte.id}
            coordinate={{
              latitude: reporte.latitud_aproximada,
              longitude: reporte.longitud_aproximada,
            }}
            title={reporte.estado === 'verificada' ? 'Alerta verificada' : 'Reporte ciudadano'}
            description={reporte.categoria_nombre}
          />
        ))}
      </MapView>
      {reportesQuery.error ? <MensajeConfiguracion error={reportesQuery.error} /> : null}
      <Text style={styles.leyenda}>
        Se muestra ubicación aproximada pública. La ubicación exacta queda protegida.
      </Text>
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
  mapa: {
    flex: 1,
  },
  leyenda: {
    color: '#334155',
    textAlign: 'center',
  },
});
