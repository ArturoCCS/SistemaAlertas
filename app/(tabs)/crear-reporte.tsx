import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MensajeConfiguracion } from '@/src/components/mensaje-configuracion';
import { useCategorias } from '@/src/hooks/use-categorias';
import { useCrearReporte } from '@/src/hooks/use-reportes';

export default function CrearReporteScreen() {
  const categoriasQuery = useCategorias();
  const crearReporte = useCrearReporte();
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');

  async function enviar() {
    if (!categoriaId) {
      Alert.alert('Falta categoría', 'Captura un id de categoría para esta versión inicial.');
      return;
    }

    try {
      await crearReporte.mutateAsync({
        categoriaId,
        latitud: 19.4333,
        longitud: -102.05,
        descripcion: descripcion.trim() || null,
      });
      Alert.alert('Listo', 'Reporte enviado al servidor.');
      setDescripcion('');
    } catch (error) {
      Alert.alert(
        'No fue posible enviar',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear reporte</Text>
      {categoriasQuery.error ? <MensajeConfiguracion error={categoriasQuery.error} /> : null}
      <Text style={styles.ayuda}>Categorías cargadas: {categoriasQuery.data?.length ?? 0}</Text>
      <TextInput
        value={categoriaId}
        onChangeText={setCategoriaId}
        style={styles.campo}
        placeholder="Id de categoría"
      />
      <TextInput
        value={descripcion}
        onChangeText={setDescripcion}
        style={[styles.campo, styles.area]}
        placeholder="Descripción breve del evento"
        multiline
      />
      <Pressable onPress={enviar} style={styles.boton}>
        <Text style={styles.botonTexto}>
          {crearReporte.isPending ? 'Enviando...' : 'Enviar reporte'}
        </Text>
      </Pressable>
      <Text style={styles.nota}>
        La verificación por proximidad y usuarios distintos se valida del lado servidor.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
    backgroundColor: '#F8FAFC',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  ayuda: {
    color: '#334155',
  },
  campo: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  area: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  boton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
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
