import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { distanciaMetros } from '@/src/domain/distancia';
import { obtenerEstiloEstadoReporte, tieneClaveGoogleMapsConfigurada } from '@/src/domain/mapa';
import { debeRecibirAlerta } from '@/src/domain/radios';
import { useCategorias } from '@/src/hooks/use-categorias';
import { useCategoriaPreferencias, usePreferencias } from '@/src/hooks/use-preferencias';
import { useReaccionarReporte, useReportesPublicos } from '@/src/hooks/use-reportes';
import { useUbicacion } from '@/src/hooks/use-ubicacion';
import type { Database } from '@/src/types/database';

type ReportePublico = Database['public']['Views']['reportes_publicos']['Row'];

export default function MapaScreen() {
  const ubicacion = useUbicacion();
  const reportesQuery = useReportesPublicos();
  const categoriasQuery = useCategorias();
  const preferenciasQuery = usePreferencias();
  const categoriaPreferenciasQuery = useCategoriaPreferencias();
  const reaccionar = useReaccionarReporte();
  const [seleccionado, setSeleccionado] = useState<ReportePublico | null>(null);

  const mapaNativoDisponible = tieneClaveGoogleMapsConfigurada(
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  );

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

  async function compartir(reporte: ReportePublico) {
    const nombreCategoria = nombrePorCategoria.get(reporte.categoria_id) ?? 'Incidente';
    await Share.share({
      message: `ALERTA CERCA: ${nombreCategoria} cerca de ${reporte.latitud_aproximada.toFixed(3)}, ${reporte.longitud_aproximada.toFixed(3)}.`,
    });
  }

  return (
    <View style={styles.container}>
      {mapaNativoDisponible && ubicacion.ubicacion ? (
        <MapView
          style={styles.mapa}
          initialRegion={{
            latitude: ubicacion.ubicacion.latitud,
            longitude: ubicacion.ubicacion.longitud,
            latitudeDelta: 0.09,
            longitudeDelta: 0.04,
          }}>
          <Circle
            center={{
              latitude: ubicacion.ubicacion.latitud,
              longitude: ubicacion.ubicacion.longitud,
            }}
            radius={radioPersonalMetros}
            strokeColor="#1D4ED8"
            fillColor="rgba(29,78,216,0.08)"
          />
          {alertasCercanas.map(({ reporte }) => {
            const estilo = obtenerEstiloEstadoReporte(reporte.estado, reporte.severidad);
            return (
              <Marker
                key={reporte.id}
                coordinate={{
                  latitude: reporte.latitud_aproximada,
                  longitude: reporte.longitud_aproximada,
                }}
                pinColor={estilo.colorBorde}
                title={nombrePorCategoria.get(reporte.categoria_id) ?? 'Incidente'}
                description={estilo.etiqueta}
                onPress={() => setSeleccionado(reporte)}
              />
            );
          })}
        </MapView>
      ) : (
        <View style={styles.mapaRespaldo}>
          <Text style={styles.mapaRespaldoTitulo}>
            {mapaNativoDisponible ? 'Obteniendo tu ubicación…' : 'Mapa nativo no configurado'}
          </Text>
          {!mapaNativoDisponible ? (
            <Text style={styles.mapaRespaldoTexto}>
              Falta EXPO_PUBLIC_GOOGLE_MAPS_API_KEY. Mientras tanto, usa la lista de abajo.
            </Text>
          ) : null}
        </View>
      )}

      {reportesQuery.error ? <MensajeConfiguracion error={reportesQuery.error} /> : null}

      {seleccionado ? (
        <View style={styles.detalle}>
          <Text style={styles.detalleTitulo}>
            {nombrePorCategoria.get(seleccionado.categoria_id) ?? 'Incidente'}
          </Text>
          <Text style={styles.detalleTexto}>
            {obtenerEstiloEstadoReporte(seleccionado.estado, seleccionado.severidad).etiqueta} ·{' '}
            {new Date(seleccionado.created_at).toLocaleString('es-MX')}
          </Text>
          {seleccionado.descripcion ? (
            <Text style={styles.detalleTexto}>{seleccionado.descripcion}</Text>
          ) : null}
          <View style={styles.filaBotonesDetalle}>
            <Pressable
              style={styles.botonDetalle}
              onPress={() => reaccionar.mutate({ reporteId: seleccionado.id, tipo: 'confirma' })}>
              <Text style={styles.botonDetalleTexto}>Yo también lo veo</Text>
            </Pressable>
            <Pressable
              style={styles.botonDetalle}
              onPress={() => reaccionar.mutate({ reporteId: seleccionado.id, tipo: 'desmiente' })}>
              <Text style={styles.botonDetalleTexto}>Esto no es cierto</Text>
            </Pressable>
          </View>
          <Pressable style={styles.botonDetalleSecundario} onPress={() => compartir(seleccionado)}>
            <Text style={styles.botonDetalleSecundarioTexto}>Compartir</Text>
          </Pressable>
          <Pressable onPress={() => setSeleccionado(null)}>
            <Text style={styles.cerrarDetalle}>Cerrar</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.panelReportes}>
          <Text style={styles.panelTitulo}>Alertas dentro de tu radio ({alertasCercanas.length})</Text>
          <ScrollView contentContainerStyle={styles.panelContenido}>
            {alertasCercanas.length > 0 ? (
              alertasCercanas.map(({ reporte, distancia }) => {
                const estilo = obtenerEstiloEstadoReporte(reporte.estado, reporte.severidad);

                return (
                  <Pressable
                    key={reporte.id}
                    style={styles.reporteFila}
                    onPress={() => setSeleccionado(reporte)}>
                    <Text style={styles.reporteCategoria}>
                      {nombrePorCategoria.get(reporte.categoria_id) ?? 'Incidente'}
                    </Text>
                    <View
                      style={[
                        styles.estadoInsignia,
                        { borderColor: estilo.colorBorde, backgroundColor: estilo.colorFondo },
                      ]}>
                      <Text style={[styles.estadoInsigniaTexto, { color: estilo.colorTexto }]}>
                        {estilo.etiqueta}
                      </Text>
                    </View>
                    <Text style={styles.reporteUbicacion}>{(distancia / 1000).toFixed(1)} km de ti</Text>
                  </Pressable>
                );
              })
            ) : (
              <Text style={styles.sinReportes}>No hay alertas dentro de tu radio por ahora.</Text>
            )}
          </ScrollView>
        </View>
      )}
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
    maxHeight: 240,
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
  detalle: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 8,
  },
  detalleTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  detalleTexto: {
    color: '#334155',
  },
  filaBotonesDetalle: {
    flexDirection: 'row',
    gap: 8,
  },
  botonDetalle: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonDetalleTexto: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  botonDetalleSecundario: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  botonDetalleSecundarioTexto: {
    color: '#334155',
    fontWeight: '600',
  },
  cerrarDetalle: {
    textAlign: 'center',
    color: '#64748B',
  },
});
