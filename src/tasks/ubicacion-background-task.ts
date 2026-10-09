import * as Location from 'expo-location';

import { celdaDeCoordenada } from '@/src/domain/h3';
import { actualizarCeldaPerfil } from '@/src/services/ubicacion';
import { ejecutandoEnExpoGo } from '@/src/utils/entorno';

export const TAREA_ACTUALIZAR_CELDA = 'alerta-cerca-actualizar-celda';

// Evita llamadas repetidas al servidor si el usuario no cambió de celda H3.
let ultimaCeldaEnviada: string | null = null;
let tareaRegistrada = false;

/**
 * Registra la tarea de `expo-task-manager` solo cuando hace falta (no al
 * importar el módulo). `expo-task-manager` no existe en Expo Go, así que un
 * `import` estático de primer nivel tronaría la app entera al arrancar
 * aunque nadie use ubicación en segundo plano; con import dinámico + try/catch
 * esa limitación queda contenida aquí, sin afectar el resto de la app.
 */
export async function registrarTareaActualizarCelda(): Promise<boolean> {
  if (tareaRegistrada) {
    return true;
  }

  if (ejecutandoEnExpoGo) {
    return false;
  }

  try {
    const TaskManager = await import('expo-task-manager');

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

    tareaRegistrada = true;
    return true;
  } catch (error) {
    console.error('No se pudo registrar la tarea de ubicación en segundo plano', error);
    return false;
  }
}
