import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useCategorias } from '@/src/hooks/use-categorias';
import {
  useActualizarCategoriaPreferencia,
  useActualizarPreferencias,
  useCategoriaPreferencias,
} from '@/src/hooks/use-preferencias';
import { useSesion } from '@/src/hooks/use-sesion';
import { useUbicacion } from '@/src/hooks/use-ubicacion';
import { marcarOnboardingCompletado } from '@/src/services/preferencias';

const PASO_RADIO_METROS = 1000;
const RADIO_MINIMO_METROS = 1000;
const RADIO_MAXIMO_METROS = 50000;

export default function PreferenciasInicialesScreen() {
  const { usuario } = useSesion();
  const ubicacion = useUbicacion();
  const categoriasQuery = useCategorias();
  const categoriaPreferenciasQuery = useCategoriaPreferencias();
  const actualizarCategoriaPreferencia = useActualizarCategoriaPreferencia();
  const actualizarPreferencias = useActualizarPreferencias();

  const [radioMetros, setRadioMetros] = useState(5000);
  const [guardando, setGuardando] = useState(false);

  const categoriasActivas = new Map(
    (categoriaPreferenciasQuery.data ?? []).map((c) => [c.categoria_id, c.activa]),
  );

  async function finalizar() {
    if (!usuario) {
      return;
    }

    setGuardando(true);
    try {
      await actualizarPreferencias.mutateAsync({ radio_personal_metros: radioMetros });
      await marcarOnboardingCompletado(usuario.id);
      await ubicacion.activarSeguimientoEnSegundoPlano();
      router.replace('/(tabs)');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Antes de empezar</Text>
      <Text style={styles.subtitulo}>
        Configura qué tan lejos quieres recibir alertas y de qué categorías. Puedes cambiarlo
        después en Ajustes.
      </Text>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Permiso de ubicación</Text>
        {ubicacion.cargando ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.valor}>
            {ubicacion.permisoConcedido ? 'Concedido' : 'No concedido — algunas funciones no estarán disponibles'}
          </Text>
        )}
        {ubicacion.error ? <Text style={styles.error}>{ubicacion.error}</Text> : null}
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Radio personal</Text>
        <Text style={styles.valor}>{(radioMetros / 1000).toFixed(0)} km</Text>
        <View style={styles.filaBotones}>
          <Pressable
            style={styles.botonPaso}
            onPress={() => setRadioMetros((r) => Math.max(RADIO_MINIMO_METROS, r - PASO_RADIO_METROS))}>
            <Text style={styles.botonPasoTexto}>−1 km</Text>
          </Pressable>
          <Pressable
            style={styles.botonPaso}
            onPress={() => setRadioMetros((r) => Math.min(RADIO_MAXIMO_METROS, r + PASO_RADIO_METROS))}>
            <Text style={styles.botonPasoTexto}>+1 km</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Categorías activas</Text>
        {categoriasQuery.data?.map((categoria) => (
          <View key={categoria.id} style={styles.filaCategoria}>
            <Text style={styles.categoriaNombre}>{categoria.nombre}</Text>
            <Switch
              value={categoriasActivas.get(categoria.id) ?? categoria.nombre !== 'Otro'}
              onValueChange={(valor) =>
                actualizarCategoriaPreferencia.mutate({ categoriaId: categoria.id, activa: valor })
              }
            />
          </View>
        ))}
      </View>

      <Pressable style={styles.boton} onPress={finalizar} disabled={guardando}>
        {guardando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.botonTexto}>Continuar</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
    backgroundColor: '#F8FAFC',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitulo: {
    color: '#334155',
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
  },
  etiqueta: {
    fontWeight: '700',
    color: '#0F172A',
  },
  valor: {
    color: '#1D4ED8',
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    color: '#B91C1C',
    fontSize: 12,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonPaso: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonPasoTexto: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  filaCategoria: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoriaNombre: {
    color: '#0F172A',
  },
  boton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
