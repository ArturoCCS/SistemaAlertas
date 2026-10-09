import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { distanciaMetros } from '@/src/domain/distancia';
import { obtenerEstiloEstadoReporte } from '@/src/domain/mapa';
import { debeRecibirAlerta } from '@/src/domain/radios';
import { useCategorias } from '@/src/hooks/use-categorias';
import { useCategoriaPreferencias, usePreferencias } from '@/src/hooks/use-preferencias';
import { useReaccionarReporte, useReportesPublicos } from '@/src/hooks/use-reportes';
import { useUbicacion } from '@/src/hooks/use-ubicacion';

export default function MapaWebScreen() {
  const ubicacion = useUbicacion();
  const reportesQuery = useReportesPublicos();
  const categoriasQuery = useCategorias();
  const preferenciasQuery = usePreferencias();
  const categoriaPreferenciasQuery = useCategoriaPreferencias();
  const reaccionar = useReaccionarReporte();

  const nombrePorCategoria = useMemo(
    () => new Map((categoriasQuery.data ?? []).map((c) => [c.id, c.nombre])),
    [categoriasQuery.data],
  );

  const categoriaActivaPorId = useMemo(
    () => new Map((categoriaPreferenciasQuery.data ?? []).map((c) => [c.categoria_id, c.activa])),
    [categoriaPreferenciasQuery.data],
  );

  const radioPersonalMetros = preferenciasQuery.data?.radio_personal_metros ?? 5000;
  const verNoConfirmados = preferenciasQuery.data?.ver_no_confirmados ?? true;

  const alertasCercanas = useMemo(() => {
    if (!ubicacion.ubicacion) {
      return [];
    }

    return (reportesQuery.data ?? [])
      .map((reporte) => ({
        reporte,
        distancia: distanciaMetros(
          ubicacion.ubicacion!.latitud,
          ubicacion.ubicacion!.longitud,
          reporte.latitud_aproximada,
          reporte.longitud_aproximada,
        ),
      }))
      .filter(({ reporte, distancia }) =>
        debeRecibirAlerta({
          distanciaMetros: distancia,
          radioPersonalMetros,
          radioAlertaActualMetros: reporte.radio_actual_metros,
          categoriaActiva: categoriaActivaPorId.get(reporte.categoria_id) ?? true,
          verNoConfirmados,
          estado: reporte.estado,
        }),
      )
      .sort((a, b) => a.distancia - b.distancia);
  }, [reportesQuery.data, ubicacion.ubicacion, radioPersonalMetros, verNoConfirmados, categoriaActivaPorId]);

  return (
    <View style={styles.container}>
      <Text style={styles.leyenda}>
        En web esta versión muestra solo la lista filtrada por tu radio. El mapa nativo usa
        react-native-maps en iOS y Android.
      </Text>

      {reportesQuery.error ? <MensajeConfiguracion error={reportesQuery.error} /> : null}
      {ubicacion.error ? <Text style={styles.error}>{ubicacion.error}</Text> : null}

      <ScrollView contentContainerStyle={styles.lista}>
        {alertasCercanas.map(({ reporte, distancia }) => {
          const estilo = obtenerEstiloEstadoReporte(reporte.estado, reporte.severidad);

          return (
            <View key={reporte.id} style={styles.tarjeta}>
              <Text style={styles.tituloTarjeta}>
                {nombrePorCategoria.get(reporte.categoria_id) ?? 'Incidente'}
              </Text>
              <Text style={[styles.subtituloTarjeta, { color: estilo.colorTexto }]}>
                {estilo.etiqueta} · {(distancia / 1000).toFixed(1)} km de ti
              </Text>
              <View style={styles.filaBotones}>
                <Pressable
                  style={styles.boton}
                  onPress={() => reaccionar.mutate({ reporteId: reporte.id, tipo: 'confirma' })}>
                  <Text style={styles.botonTexto}>Yo también lo veo</Text>
                </Pressable>
                <Pressable
                  style={styles.boton}
                  onPress={() => reaccionar.mutate({ reporteId: reporte.id, tipo: 'desmiente' })}>
                  <Text style={styles.botonTexto}>Esto no es cierto</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
        {alertasCercanas.length === 0 ? (
          <Text style={styles.sinReportes}>No hay alertas dentro de tu radio por ahora.</Text>
        ) : null}
      </ScrollView>
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
  error: {
    color: '#B91C1C',
    textAlign: 'center',
  },
  lista: {
    gap: 10,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  tituloTarjeta: {
    fontWeight: '600',
    color: '#0F172A',
  },
  subtituloTarjeta: {
    fontWeight: '600',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 8,
  },
  boton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 12,
  },
  sinReportes: {
    color: '#64748B',
    textAlign: 'center',
  },
});
