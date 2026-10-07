import { StyleSheet, Text, View } from 'react-native';

type MensajeConfiguracionProps = {
  error: unknown;
};

export function MensajeConfiguracion({ error }: MensajeConfiguracionProps) {
  const mensaje = error instanceof Error ? error.message : 'No fue posible conectarse al backend.';

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Modo sin backend configurado</Text>
      <Text style={styles.mensaje}>{mensaje}</Text>
      <Text style={styles.mensaje}>Revisa .env.example y configura tus variables EXPO_PUBLIC_*.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderWidth: 1,
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  titulo: {
    color: '#92400E',
    fontWeight: '700',
  },
  mensaje: {
    color: '#78350F',
  },
});
