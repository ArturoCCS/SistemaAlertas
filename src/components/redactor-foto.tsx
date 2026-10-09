import * as ImageManipulator from 'expo-image-manipulator';
import { useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Caja = { x: number; y: number };

const ANCHO_CAJA = 60;
const ALTO_CAJA = 40;

type RedactorFotoProps = {
  uriOriginal: string;
  onConfirmar: (uriFinal: string) => void;
  onCancelar: () => void;
};

/**
 * Sustituto de "blur automático de rostros/placas" (fuera de alcance sin un
 * modelo de detección): el usuario tapa manualmente zonas sensibles con
 * cajas negras antes de enviar. `react-native-view-shot` aplana imagen+cajas
 * en un archivo nuevo; `expo-image-manipulator` lo recomprime, lo que
 * también elimina los metadatos EXIF.
 */
export function RedactorFoto({ uriOriginal, onConfirmar, onCancelar }: RedactorFotoProps) {
  const contenedorRef = useRef<View>(null);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [procesando, setProcesando] = useState(false);

  function alTocar(evento: { nativeEvent: { locationX: number; locationY: number } }) {
    const { locationX, locationY } = evento.nativeEvent;
    setCajas((previas) => [
      ...previas,
      { x: locationX - ANCHO_CAJA / 2, y: locationY - ALTO_CAJA / 2 },
    ]);
  }

  async function confirmar() {
    setProcesando(true);
    try {
      let uriCapturada = uriOriginal;

      if (cajas.length > 0 && contenedorRef.current) {
        try {
          // Import dinámico: `react-native-view-shot` no existe en Expo Go
          // (requiere un build propio) y no debe tronar el resto de la app.
          const { captureRef } = await import('react-native-view-shot');
          uriCapturada = await captureRef(contenedorRef, { format: 'jpg', quality: 0.9 });
        } catch (error) {
          console.error('No se pudo aplicar la redacción manual', error);
          Alert.alert(
            'Redacción no disponible',
            'Cubrir zonas con cajas negras requiere un build propio de la app (no funciona en Expo Go). Se usará la foto original.',
          );
        }
      }

      const resultado = await ImageManipulator.manipulateAsync(
        uriCapturada,
        [{ resize: { width: 1280 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );

      onConfirmar(resultado.uri);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.ayuda}>
        Toca sobre rostros o placas para cubrirlos con una caja negra antes de enviar (opcional).
      </Text>

      <Pressable onPress={alTocar}>
        <View ref={contenedorRef} collapsable={false} style={styles.lienzo}>
          <Image source={{ uri: uriOriginal }} style={styles.imagen} resizeMode="contain" />
          {cajas.map((caja, indice) => (
            <View
              key={indice}
              style={[
                styles.caja,
                { left: caja.x, top: caja.y, width: ANCHO_CAJA, height: ALTO_CAJA },
              ]}
            />
          ))}
        </View>
      </Pressable>

      <View style={styles.filaBotones}>
        <Pressable
          style={styles.botonSecundario}
          onPress={() => setCajas((previas) => previas.slice(0, -1))}
          disabled={cajas.length === 0}>
          <Text style={styles.botonSecundarioTexto}>Quitar última caja</Text>
        </Pressable>
        <Pressable style={styles.botonSecundario} onPress={onCancelar}>
          <Text style={styles.botonSecundarioTexto}>Quitar foto</Text>
        </Pressable>
      </View>

      <Pressable style={styles.botonPrincipal} onPress={confirmar} disabled={procesando}>
        <Text style={styles.botonPrincipalTexto}>
          {procesando ? 'Procesando…' : 'Usar esta foto'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 8,
  },
  ayuda: {
    color: '#475569',
    fontSize: 12,
  },
  lienzo: {
    width: '100%',
    height: 260,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  caja: {
    position: 'absolute',
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 8,
  },
  botonSecundario: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: '#334155',
    fontWeight: '600',
  },
  botonPrincipal: {
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonPrincipalTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
