import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { RedactorFoto } from '@/src/components/redactor-foto';
import { useCategorias } from '@/src/hooks/use-categorias';
import { useCrearReporte } from '@/src/hooks/use-reportes';
import { useSesion } from '@/src/hooks/use-sesion';
import { useUbicacion } from '@/src/hooks/use-ubicacion';
import { subirFotoReporte } from '@/src/services/fotos';

export default function CrearReporteScreen() {
  const { usuario } = useSesion();
  const categoriasQuery = useCategorias();
  const ubicacion = useUbicacion();
  const crearReporte = useCrearReporte();

  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [fotoPendiente, setFotoPendiente] = useState<string | null>(null);
  const [fotoLista, setFotoLista] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  async function elegirFoto(origen: 'camara' | 'galeria') {
    const permiso =
      origen === 'camara'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos ese permiso para adjuntar una foto.');
      return;
    }

    const resultado =
      origen === 'camara'
        ? await ImagePicker.launchCameraAsync({ quality: 0.9 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });

    if (!resultado.canceled && resultado.assets[0]) {
      setFotoLista(null);
      setFotoPendiente(resultado.assets[0].uri);
    }
  }

  async function enviar() {
    if (!categoriaId) {
      Alert.alert('Falta categoría', 'Elige qué tipo de incidente estás reportando.');
      return;
    }

    if (!ubicacion.ubicacion) {
      Alert.alert('Falta ubicación', 'Necesitamos tu ubicación para publicar el reporte.');
      return;
    }

    if (!usuario) {
      Alert.alert('Sesión requerida', 'Inicia sesión para reportar.');
      return;
    }

    try {
      let fotoUrl: string | null = null;

      if (fotoLista) {
        setSubiendoFoto(true);
        fotoUrl = await subirFotoReporte(usuario.id, fotoLista);
      }

      await crearReporte.mutateAsync({
        categoriaId,
        latitud: ubicacion.ubicacion.latitud,
        longitud: ubicacion.ubicacion.longitud,
        celdaH3: ubicacion.ubicacion.celdaH3,
        descripcion: descripcion.trim() || null,
        fotoUrl,
      });

      Alert.alert('Reporte enviado', 'Gracias, tu reporte ya está en revisión de la comunidad.');
      setCategoriaId(null);
      setDescripcion('');
      setFotoPendiente(null);
      setFotoLista(null);
      router.replace('/(tabs)/mapa');
    } catch (error) {
      Alert.alert(
        'No fue posible enviar',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    } finally {
      setSubiendoFoto(false);
    }
  }

  const enviando = crearReporte.isPending || subiendoFoto;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Reportar un incidente</Text>

      {categoriasQuery.error ? <MensajeConfiguracion error={categoriasQuery.error} /> : null}

      <Text style={styles.seccion}>1. ¿Qué está pasando?</Text>
      <View style={styles.grid}>
        {categoriasQuery.data?.map((categoria) => (
          <Pressable
            key={categoria.id}
            onPress={() => setCategoriaId(categoria.id)}
            style={[
              styles.categoriaBoton,
              categoriaId === categoria.id && styles.categoriaBotonActivo,
            ]}>
            <Text
              style={[
                styles.categoriaTexto,
                categoriaId === categoria.id && styles.categoriaTextoActivo,
              ]}>
              {categoria.nombre}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.seccion}>2. Ubicación</Text>
      <View style={styles.tarjetaUbicacion}>
        {ubicacion.cargando ? (
          <ActivityIndicator />
        ) : ubicacion.ubicacion ? (
          <Text style={styles.ubicacionTexto}>
            {ubicacion.ubicacion.latitud.toFixed(5)}, {ubicacion.ubicacion.longitud.toFixed(5)}
          </Text>
        ) : (
          <Text style={styles.ubicacionTexto}>Sin ubicación todavía.</Text>
        )}
        {ubicacion.error ? <Text style={styles.ubicacionError}>{ubicacion.error}</Text> : null}
        <Pressable onPress={() => ubicacion.refrescar()} style={styles.botonEnlace}>
          <Text style={styles.botonEnlaceTexto}>Actualizar mi ubicación</Text>
        </Pressable>
      </View>

      <Text style={styles.seccion}>3. Opcional: descripción y foto</Text>
      <TextInput
        value={descripcion}
        onChangeText={setDescripcion}
        style={styles.area}
        placeholder="Describe brevemente lo que ves (opcional)"
        placeholderTextColor="#94A3B8"
        multiline
      />

      {fotoPendiente && !fotoLista ? (
        <RedactorFoto
          uriOriginal={fotoPendiente}
          onConfirmar={(uri) => setFotoLista(uri)}
          onCancelar={() => setFotoPendiente(null)}
        />
      ) : fotoLista ? (
        <View style={styles.fotoListaContenedor}>
          <Image source={{ uri: fotoLista }} style={styles.fotoListaPreview} />
          <Pressable
            style={styles.botonEnlace}
            onPress={() => {
              setFotoLista(null);
              setFotoPendiente(null);
            }}>
            <Text style={styles.botonEnlaceTexto}>Quitar foto</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.filaFoto}>
          <Pressable style={styles.botonFoto} onPress={() => elegirFoto('camara')}>
            <Text style={styles.botonFotoTexto}>Tomar foto</Text>
          </Pressable>
          <Pressable style={styles.botonFoto} onPress={() => elegirFoto('galeria')}>
            <Text style={styles.botonFotoTexto}>Elegir de galería</Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={enviar} style={styles.boton} disabled={enviando}>
        {enviando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.botonTexto}>Enviar reporte</Text>
        )}
      </Pressable>

      <Text style={styles.nota}>
        Tu identidad nunca se muestra a otros usuarios. La ubicación pública se difumina ~100 m
        hasta que el reporte se verifique.
      </Text>
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
  seccion: {
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriaBoton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  categoriaBotonActivo: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  categoriaTexto: {
    color: '#0F172A',
    fontWeight: '600',
  },
  categoriaTextoActivo: {
    color: '#FFFFFF',
  },
  tarjetaUbicacion: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  ubicacionTexto: {
    color: '#0F172A',
    fontWeight: '600',
  },
  ubicacionError: {
    color: '#B91C1C',
    fontSize: 12,
  },
  botonEnlace: {
    marginTop: 4,
  },
  botonEnlaceTexto: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  area: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  filaFoto: {
    flexDirection: 'row',
    gap: 8,
  },
  botonFoto: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1D4ED8',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonFotoTexto: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  fotoListaContenedor: {
    gap: 6,
  },
  fotoListaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
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
  nota: {
    color: '#475569',
    fontSize: 12,
  },
});
