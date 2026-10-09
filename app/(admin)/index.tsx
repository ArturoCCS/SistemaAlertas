import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { useCategorias } from '@/src/hooks/use-categorias';
import {
  useCerrarReporte,
  useDescartarReporte,
  useReportesPendientesModeracion,
  useVerificarReporte,
} from '@/src/hooks/use-moderacion';
import { obtenerUrlFirmadaFoto } from '@/src/services/moderacion';
import { obtenerEtiquetaEstadoReporte } from '@/src/domain/mapa';
import type { Database } from '@/src/types/database';

type Reporte = Database['public']['Tables']['reportes']['Row'];

function FotoReporte({ rutaFoto }: { rutaFoto: string }) {
  const urlQuery = useQuery({
    queryKey: ['foto-firmada', rutaFoto],
    queryFn: () => obtenerUrlFirmadaFoto(rutaFoto),
  });

  if (urlQuery.isLoading) {
    return <ActivityIndicator />;
  }

  if (!urlQuery.data) {
    return null;
  }

  return <Image source={{ uri: urlQuery.data }} style={styles.foto} />;
}

function FilaReporte({ reporte, nombreCategoria }: { reporte: Reporte; nombreCategoria: string }) {
  const verificar = useVerificarReporte();
  const descartar = useDescartarReporte();
  const cerrar = useCerrarReporte();
  const [motivo, setMotivo] = useState('');

  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <Text style={styles.categoria}>{nombreCategoria}</Text>
        <Text style={styles.estado}>{obtenerEtiquetaEstadoReporte(reporte.estado)}</Text>
      </View>

      <Text style={styles.coordenadas}>
        Ubicación exacta: {reporte.latitud_exacta.toFixed(5)}, {reporte.longitud_exacta.toFixed(5)}
      </Text>

      {reporte.descripcion ? <Text style={styles.descripcion}>{reporte.descripcion}</Text> : null}
      {reporte.foto_url ? <FotoReporte rutaFoto={reporte.foto_url} /> : null}

      <View style={styles.filaBotones}>
        <Pressable
          style={[styles.boton, styles.botonVerificar]}
          onPress={() => verificar.mutate({ reporteId: reporte.id })}
          disabled={verificar.isPending}>
          <Text style={styles.botonTexto}>Verificar</Text>
        </Pressable>
        <Pressable
          style={[styles.boton, styles.botonCerrar]}
          onPress={() => cerrar.mutate(reporte.id)}
          disabled={cerrar.isPending}>
          <Text style={styles.botonTexto}>Cerrar</Text>
        </Pressable>
      </View>

      <TextInput
        value={motivo}
        onChangeText={setMotivo}
        placeholder="Motivo de descarte (obligatorio para descartar)"
        placeholderTextColor="#94A3B8"
        style={styles.campoMotivo}
      />
      <Pressable
        style={[styles.boton, styles.botonDescartar]}
        onPress={() => {
          descartar.mutate({ reporteId: reporte.id, motivo });
          setMotivo('');
        }}
        disabled={descartar.isPending || !motivo.trim()}>
        <Text style={styles.botonTexto}>Descartar</Text>
      </Pressable>

      {verificar.error || descartar.error || cerrar.error ? (
        <MensajeConfiguracion error={verificar.error ?? descartar.error ?? cerrar.error} />
      ) : null}
    </View>
  );
}

export default function ModeracionScreen() {
  const pendientesQuery = useReportesPendientesModeracion();
  const categoriasQuery = useCategorias();
  const nombrePorCategoria = new Map((categoriasQuery.data ?? []).map((c) => [c.id, c.nombre]));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Cola de moderación</Text>
      <Link href="/(admin)/historial" style={styles.enlace}>
        Ver historial de acciones
      </Link>

      {pendientesQuery.error ? <MensajeConfiguracion error={pendientesQuery.error} /> : null}

      {pendientesQuery.data?.length ? (
        pendientesQuery.data.map((reporte) => (
          <FilaReporte
            key={reporte.id}
            reporte={reporte}
            nombreCategoria={nombrePorCategoria.get(reporte.categoria_id) ?? 'Categoría'}
          />
        ))
      ) : (
        <Text style={styles.vacio}>No hay reportes pendientes de moderación.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  enlace: {
    color: '#1D4ED8',
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 8,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoria: {
    fontWeight: '700',
    color: '#0F172A',
  },
  estado: {
    color: '#92400E',
  },
  coordenadas: {
    color: '#334155',
    fontSize: 12,
  },
  descripcion: {
    color: '#1E293B',
  },
  foto: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 8,
  },
  boton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonVerificar: {
    backgroundColor: '#047857',
  },
  botonCerrar: {
    backgroundColor: '#64748B',
  },
  botonDescartar: {
    backgroundColor: '#B91C1C',
  },
  botonTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  campoMotivo: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  vacio: {
    color: '#64748B',
  },
});
