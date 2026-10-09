import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { celdaDeCoordenada } from '@/src/domain/h3';
import { actualizarCeldaPerfil } from '@/src/services/ubicacion';

export const TAREA_ACTUALIZAR_CELDA = 'alerta-cerca-actualizar-celda';

// Evita llamadas repetidas al servidor si el usuario no cambió de celda H3.
let ultimaCeldaEnviada: string | null = null;

TaskManager.defineTask(TAREA_ACTUALIZAR_CELDA, async ({ data, error }) => {
  if (error) {
    console.error('Tarea de ubicación en segundo plano falló', error);
    return;
  }

  const { locations } = (data ?? {}) as { locations?: Location.LocationObject[] };
  const ubicacion = locations?.[locations.length - 1];

  if (!ubicacion) {
    return;
  }

  const celda = celdaDeCoordenada(ubicacion.coords.latitude, ubicacion.coords.longitude);

  if (celda === ultimaCeldaEnviada) {
    return;
  }

  try {
    await actualizarCeldaPerfil(celda);
    ultimaCeldaEnviada = celda;
  } catch (errorEnvio) {
    console.error('No se pudo actualizar la celda del perfil', errorEnvio);
  }
});
