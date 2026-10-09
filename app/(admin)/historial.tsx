import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { useHistorialModeracion } from '@/src/hooks/use-moderacion';

const ETIQUETA_ACCION: Record<string, string> = {
  verificar: 'Verificó',
  descartar: 'Descartó',
  cerrar: 'Cerró',
};

export default function HistorialModeracionScreen() {
  const historialQuery = useHistorialModeracion();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Historial de moderación</Text>

      {historialQuery.error ? <MensajeConfiguracion error={historialQuery.error} /> : null}

      {historialQuery.data?.length ? (
        historialQuery.data.map((entrada) => (
          <View key={entrada.id} style={styles.fila}>
            <Text style={styles.accion}>{ETIQUETA_ACCION[entrada.accion] ?? entrada.accion}</Text>
            <Text style={styles.fecha}>{new Date(entrada.created_at).toLocaleString('es-MX')}</Text>
            {entrada.detalle && Object.keys(entrada.detalle as object).length > 0 ? (
              <Text style={styles.detalle}>{JSON.stringify(entrada.detalle)}</Text>
            ) : null}
          </View>
        ))
      ) : (
        <Text style={styles.vacio}>Todavía no hay acciones registradas.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10,
    backgroundColor: '#F8FAFC',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  fila: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 4,
  },
  accion: {
    fontWeight: '700',
    color: '#0F172A',
  },
  fecha: {
    color: '#64748B',
    fontSize: 12,
  },
  detalle: {
    color: '#334155',
    fontSize: 12,
  },
  vacio: {
    color: '#64748B',
  },
});
