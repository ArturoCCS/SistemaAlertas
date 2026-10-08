import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { obtenerEtiquetaEstadoReporte, tieneClaveGoogleMapsConfigurada } from '@/src/domain/mapa';
import { useReportesPublicos } from '@/src/hooks/use-reportes';
import type { EstadoReporte } from '@/src/types/database';

type EstiloEstado = {
  etiqueta: string;
  colorTexto: string;
  colorBorde: string;
  colorFondo: string;
};

const ESTILOS_ESTADO: Record<EstadoReporte, EstiloEstado> = {
  no_confirmada: {
    etiqueta: obtenerEtiquetaEstadoReporte('no_confirmada'),
    colorTexto: '#92400E',
    colorBorde: '#D97706',
    colorFondo: '#FFFBEB',
  },
  verificada: {
    etiqueta: obtenerEtiquetaEstadoReporte('verificada'),
    colorTexto: '#065F46',
    colorBorde: '#047857',
    colorFondo: '#ECFDF5',
  },
  manual_verificada: {
    etiqueta: obtenerEtiquetaEstadoReporte('manual_verificada'),
    colorTexto: '#065F46',
    colorBorde: '#047857',
    colorFondo: '#ECFDF5',
  },
  rechazada: {
    etiqueta: obtenerEtiquetaEstadoReporte('rechazada'),
    colorTexto: '#991B1B',
    colorBorde: '#B91C1C',
    colorFondo: '#FEF2F2',
  },
  resuelta: {
    etiqueta: obtenerEtiquetaEstadoReporte('resuelta'),
    colorTexto: '#1E3A8A',
    colorBorde: '#1D4ED8',
    colorFondo: '#EFF6FF',
  },
};

export default function MapaScreen() {
  const reportesQuery = useReportesPublicos();
  const marcadores = useMemo(() => reportesQuery.data ?? [], [reportesQuery.data]);
  const mapaNativoDisponible = tieneClaveGoogleMapsConfigurada(
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  );

  return (
    <View style={styles.container}>
      {mapaNativoDisponible ? (
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
              title={ESTILOS_ESTADO[reporte.estado].etiqueta}
              description={reporte.categoria_nombre}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.mapaRespaldo}>
          <Text style={styles.mapaRespaldoTitulo}>Mapa nativo no configurado</Text>
          <Text style={styles.mapaRespaldoTexto}>
            Falta EXPO_PUBLIC_GOOGLE_MAPS_API_KEY. Este modo permite probar la app sin exponer
            claves privadas.
          </Text>
        </View>
      )}
      {reportesQuery.error ? <MensajeConfiguracion error={reportesQuery.error} /> : null}
      <View style={styles.panelReportes}>
        <Text style={styles.panelTitulo}>Reportes públicos disponibles</Text>
        <ScrollView contentContainerStyle={styles.panelContenido}>
          {marcadores.length > 0 ? (
            marcadores.map((reporte) => {
              const estado = ESTILOS_ESTADO[reporte.estado];

              return (
                <View key={reporte.id} style={styles.reporteFila}>
                  <Text style={styles.reporteCategoria}>{reporte.categoria_nombre}</Text>
                  <View
                    style={[
                      styles.estadoInsignia,
                      {
                        borderColor: estado.colorBorde,
                        backgroundColor: estado.colorFondo,
                      },
                    ]}>
                    <Text style={[styles.estadoInsigniaTexto, { color: estado.colorTexto }]}>
                      {estado.etiqueta}
                    </Text>
                  </View>
                  <Text style={styles.reporteUbicacion}>
                    Ubicación aprox: {reporte.latitud_aproximada.toFixed(3)},{' '}
                    {reporte.longitud_aproximada.toFixed(3)}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.sinReportes}>
              No hay reportes públicos disponibles por el momento.
            </Text>
          )}
        </ScrollView>
      </View>
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
    minHeight: 220,
    borderRadius: 12,
  },
  mapaRespaldo: {
    minHeight: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#E2E8F0',
    padding: 14,
    gap: 6,
    justifyContent: 'center',
  },
  mapaRespaldoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  mapaRespaldoTexto: {
    color: '#334155',
  },
  panelReportes: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
    maxHeight: 220,
  },
  panelTitulo: {
    fontWeight: '700',
    color: '#0F172A',
  },
  panelContenido: {
    gap: 8,
  },
  reporteFila: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    gap: 6,
  },
  reporteCategoria: {
    color: '#0F172A',
    fontWeight: '600',
  },
  estadoInsignia: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
  },
  estadoInsigniaTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  reporteUbicacion: {
    color: '#334155',
    fontSize: 12,
  },
  sinReportes: {
    color: '#64748B',
  },
  leyenda: {
    color: '#334155',
    textAlign: 'center',
  },
});
