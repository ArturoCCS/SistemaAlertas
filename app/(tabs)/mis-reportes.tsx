import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { obtenerEstiloEstadoReporte } from '@/src/domain/mapa';
import { useCategorias } from '@/src/hooks/use-categorias';
import { useMisReportes } from '@/src/hooks/use-reportes';

export default function MisReportesScreen() {
  const misReportesQuery = useMisReportes();
  const categoriasQuery = useCategorias();

  const nombrePorCategoria = useMemo(
    () => new Map((categoriasQuery.data ?? []).map((c) => [c.id, c.nombre])),
    [categoriasQuery.data],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Mis reportes</Text>
      {misReportesQuery.error ? <MensajeConfiguracion error={misReportesQuery.error} /> : null}
      {misReportesQuery.data?.length ? (
        misReportesQuery.data.map((reporte) => {
          const estilo = obtenerEstiloEstadoReporte(reporte.estado, reporte.severidad);

          return (
            <View key={reporte.id} style={styles.tarjeta}>
              <Text style={styles.nombre}>
                {nombrePorCategoria.get(reporte.categoria_id) ?? 'Categoría'}
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
              <Text style={styles.fecha}>{new Date(reporte.created_at).toLocaleString('es-MX')}</Text>
              {reporte.descartado_motivo ? (
                <Text style={styles.motivo}>Motivo: {reporte.descartado_motivo}</Text>
              ) : null}
            </View>
          );
        })
      ) : (
        <Text style={styles.vacio}>Aún no hay reportes para mostrar.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    gap: 6,
  },
  nombre: {
    fontWeight: '600',
    color: '#0F172A',
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
  fecha: {
    color: '#64748B',
    fontSize: 12,
  },
  motivo: {
    color: '#991B1B',
    fontSize: 12,
  },
  vacio: {
    color: '#475569',
  },
});
