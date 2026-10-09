import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { useCategorias } from '@/src/hooks/use-categorias';
import { usePermisosDispositivo } from '@/src/hooks/use-permisos-dispositivo';
import { useEsModerador } from '@/src/hooks/use-perfil';
import {
  useActualizarCategoriaPreferencia,
  useActualizarPreferencias,
  useCategoriaPreferencias,
  usePreferencias,
} from '@/src/hooks/use-preferencias';
import { useSesion } from '@/src/hooks/use-sesion';
import { useUbicacion } from '@/src/hooks/use-ubicacion';
import { useBorrarZonaGuardada, useCrearZonaGuardada, useZonasGuardadas } from '@/src/hooks/use-zonas';
import { cerrarSesion } from '@/src/services/auth';
import { eliminarCuentaPropia } from '@/src/services/cuenta';

const PASO_RADIO_METROS = 1000;
const RADIO_MINIMO_METROS = 1000;
const RADIO_MAXIMO_METROS = 50000;

export default function AjustesScreen() {
  const { usuario } = useSesion();
  const permisos = usePermisosDispositivo();
  const ubicacion = useUbicacion();
  const { esModerador } = useEsModerador();

  const preferenciasQuery = usePreferencias();
  const actualizarPreferencias = useActualizarPreferencias();
  const categoriasQuery = useCategorias();
  const categoriaPreferenciasQuery = useCategoriaPreferencias();
  const actualizarCategoriaPreferencia = useActualizarCategoriaPreferencia();

  const zonasQuery = useZonasGuardadas();
  const crearZona = useCrearZonaGuardada();
  const borrarZona = useBorrarZonaGuardada();
  const [nombreZona, setNombreZona] = useState('');

  const [eliminando, setEliminando] = useState(false);

  const radioMetros = preferenciasQuery.data?.radio_personal_metros ?? 5000;
  const categoriaActivaPorId = new Map(
    (categoriaPreferenciasQuery.data ?? []).map((c) => [c.categoria_id, c.activa]),
  );
  const horarioSilencioActivo = Boolean(
    preferenciasQuery.data?.horario_silencio_inicio && preferenciasQuery.data?.horario_silencio_fin,
  );

  function cambiarRadio(delta: number) {
    const nuevo = Math.min(
      RADIO_MAXIMO_METROS,
      Math.max(RADIO_MINIMO_METROS, radioMetros + delta),
    );
    actualizarPreferencias.mutate({ radio_personal_metros: nuevo });
  }

  function alternarHorarioSilencio(activar: boolean) {
    actualizarPreferencias.mutate(
      activar
        ? { horario_silencio_inicio: '22:00:00', horario_silencio_fin: '07:00:00' }
        : { horario_silencio_inicio: null, horario_silencio_fin: null },
    );
  }

  async function agregarZona() {
    if (!nombreZona.trim() || !ubicacion.ubicacion) {
      Alert.alert('Falta información', 'Dale un nombre y asegúrate de tener tu ubicación actual.');
      return;
    }

    await crearZona.mutateAsync({
      nombre: nombreZona.trim(),
      celdaH3: ubicacion.ubicacion.celdaH3,
      radioMetros: 1000,
    });
    setNombreZona('');
  }

  async function confirmarBorrarCuenta() {
    Alert.alert(
      'Borrar mi cuenta y datos',
      'Esta acción es permanente: se borrarán tus preferencias, zonas guardadas y tu cuenta. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: async () => {
            setEliminando(true);
            try {
              await eliminarCuentaPropia();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert(
                'No fue posible borrar la cuenta',
                error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
              );
            } finally {
              setEliminando(false);
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Ajustes</Text>

      {preferenciasQuery.error ? <MensajeConfiguracion error={preferenciasQuery.error} /> : null}

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Radio personal</Text>
        <Text style={styles.valor}>{(radioMetros / 1000).toFixed(0)} km</Text>
        <View style={styles.filaBotones}>
          <Pressable style={styles.botonPaso} onPress={() => cambiarRadio(-PASO_RADIO_METROS)}>
            <Text style={styles.botonPasoTexto}>−1 km</Text>
          </Pressable>
          <Pressable style={styles.botonPaso} onPress={() => cambiarRadio(PASO_RADIO_METROS)}>
            <Text style={styles.botonPasoTexto}>+1 km</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.tarjeta}>
        <View style={styles.filaSwitch}>
          <Text style={styles.etiqueta}>Ver reportes sin confirmar</Text>
          <Switch
            value={preferenciasQuery.data?.ver_no_confirmados ?? true}
            onValueChange={(valor) => actualizarPreferencias.mutate({ ver_no_confirmados: valor })}
          />
        </View>
        <View style={styles.filaSwitch}>
          <Text style={styles.etiqueta}>Horario de silencio (22:00–07:00)</Text>
          <Switch value={horarioSilencioActivo} onValueChange={alternarHorarioSilencio} />
        </View>
        <View style={styles.filaSwitch}>
          <Text style={styles.etiqueta}>Permitir alertas críticas en silencio</Text>
          <Switch
            value={preferenciasQuery.data?.autoriza_alertas_criticas_en_silencio ?? true}
            onValueChange={(valor) =>
              actualizarPreferencias.mutate({ autoriza_alertas_criticas_en_silencio: valor })
            }
          />
        </View>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Categorías activas</Text>
        {categoriasQuery.data?.map((categoria) => (
          <View key={categoria.id} style={styles.filaSwitch}>
            <Text style={styles.categoriaNombre}>{categoria.nombre}</Text>
            <Switch
              value={categoriaActivaPorId.get(categoria.id) ?? categoria.nombre !== 'Otro'}
              onValueChange={(valor) =>
                actualizarCategoriaPreferencia.mutate({ categoriaId: categoria.id, activa: valor })
              }
            />
          </View>
        ))}
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Zonas guardadas</Text>
        {zonasQuery.data?.map((zona) => (
          <View key={zona.id} style={styles.filaZona}>
            <Text style={styles.categoriaNombre}>
              {zona.nombre} ({(zona.radio_metros / 1000).toFixed(1)} km)
            </Text>
            <Pressable onPress={() => borrarZona.mutate(zona.id)}>
              <Text style={styles.botonBorrarZona}>Quitar</Text>
            </Pressable>
          </View>
        ))}
        <TextInput
          value={nombreZona}
          onChangeText={setNombreZona}
          placeholder="Nombre (ej. Casa, Trabajo)"
          placeholderTextColor="#94A3B8"
          style={styles.campoZona}
        />
        <Pressable style={styles.botonSecundario} onPress={agregarZona} disabled={crearZona.isPending}>
          <Text style={styles.botonSecundarioTexto}>Guardar mi ubicación actual como zona</Text>
        </Pressable>
      </View>

      {esModerador ? (
        <Pressable style={styles.botonSecundario} onPress={() => router.push('/(admin)')}>
          <Text style={styles.botonSecundarioTexto}>Abrir panel de moderación</Text>
        </Pressable>
      ) : null}

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Permisos del dispositivo</Text>
        <Text style={styles.valorPequeno}>Ubicación: {permisos.estadoUbicacion}</Text>
        <Text style={styles.valorPequeno}>Notificaciones: {permisos.estadoNotificaciones}</Text>
        <Pressable
          style={styles.botonSecundario}
          onPress={() => ubicacion.activarSeguimientoEnSegundoPlano()}>
          <Text style={styles.botonSecundarioTexto}>
            Activar actualización de ubicación en segundo plano
          </Text>
        </Pressable>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Privacidad y derechos ARCO</Text>
        <Text style={styles.valorPequeno}>
          Tu ubicación exacta nunca sale de tu teléfono. El servidor solo guarda tu última celda
          aproximada (H3), sin historial. Puedes acceder, rectificar, cancelar u oponerte al uso de
          tus datos, o borrarlos por completo.
        </Text>
        <Pressable style={styles.botonPeligro} onPress={confirmarBorrarCuenta} disabled={eliminando}>
          {eliminando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botonPeligroTexto}>Borrar mi cuenta y datos</Text>
          )}
        </Pressable>
      </View>

      <Pressable
        style={styles.botonSecundario}
        onPress={async () => {
          await cerrarSesion();
          router.replace('/(auth)/login');
        }}>
        <Text style={styles.botonSecundarioTexto}>Cerrar sesión</Text>
      </Pressable>

      <Text style={styles.correo}>Sesión: {usuario?.email}</Text>
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
  valorPequeno: {
    color: '#334155',
    fontSize: 13,
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
  filaSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriaNombre: {
    color: '#0F172A',
    flex: 1,
  },
  filaZona: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botonBorrarZona: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  campoZona: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  botonSecundario: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  botonPeligro: {
    backgroundColor: '#B91C1C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonPeligroTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  correo: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
  },
});
