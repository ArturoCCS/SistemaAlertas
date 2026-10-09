import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { celdaDeCoordenada } from '@/src/domain/h3';
import { actualizarCeldaPerfil } from '@/src/services/ubicacion';
import { TAREA_ACTUALIZAR_CELDA } from '@/src/tasks/ubicacion-background-task';

export type UbicacionActual = {
  latitud: number;
  longitud: number;
  celdaH3: string;
};

export function useUbicacion() {
  const [ubicacion, setUbicacion] = useState<UbicacionActual | null>(null);
  const [permisoConcedido, setPermisoConcedido] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refrescar = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const permiso = await Location.requestForegroundPermissionsAsync();
      setPermisoConcedido(permiso.granted);

      if (!permiso.granted) {
        setError('Se necesita permiso de ubicación para reportar y ver alertas cercanas.');
        return;
      }

      const posicion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const celdaH3 = celdaDeCoordenada(posicion.coords.latitude, posicion.coords.longitude);

      setUbicacion({
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude,
        celdaH3,
      });

      void actualizarCeldaPerfil(celdaH3).catch(() => undefined);
    } catch (excepcion) {
      setError(
        excepcion instanceof Error ? excepcion.message : 'No fue posible obtener tu ubicación.',
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial deliberada al montar (patrón estándar de fetch-on-mount);
    // `refrescar` ya guarda su propio estado de carga/error.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refrescar();
  }, [refrescar]);

  // Requiere un build de desarrollo (EAS/Dev Client): Expo Go no soporta tareas en segundo plano.
  const activarSeguimientoEnSegundoPlano = useCallback(async (): Promise<boolean> => {
    const permisoFondo = await Location.requestBackgroundPermissionsAsync();

    if (!permisoFondo.granted) {
      return false;
    }

    const yaActivo = await Location.hasStartedLocationUpdatesAsync(TAREA_ACTUALIZAR_CELDA).catch(
      () => false,
    );

    if (!yaActivo) {
      await Location.startLocationUpdatesAsync(TAREA_ACTUALIZAR_CELDA, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 300,
        deferredUpdatesInterval: 60000,
        showsBackgroundLocationIndicator: false,
      });
    }

    return true;
  }, []);

  return {
    ubicacion,
    permisoConcedido,
    cargando,
    error,
    refrescar,
    activarSeguimientoEnSegundoPlano,
  };
}
