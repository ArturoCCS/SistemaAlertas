import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { ejecutandoEnExpoGo } from '@/src/utils/entorno';

type EstadoPermiso = 'pendiente' | 'concedido' | 'denegado';

export function usePermisosDispositivo() {
  const [estadoUbicacion, setEstadoUbicacion] = useState<EstadoPermiso>('pendiente');
  const [estadoNotificaciones, setEstadoNotificaciones] = useState<EstadoPermiso>('pendiente');

  useEffect(() => {
    async function cargarPermisos() {
      const ubicacion = await Location.getForegroundPermissionsAsync();
      setEstadoUbicacion(ubicacion.granted ? 'concedido' : 'denegado');

      if (ejecutandoEnExpoGo) {
        // Ni siquiera se puede importar expo-notifications en Expo Go
        // (Android, SDK 53+) sin que tire error; ver use-registro-push.ts.
        setEstadoNotificaciones('denegado');
        return;
      }

      const Notifications = await import('expo-notifications');
      const notificaciones = await Notifications.getPermissionsAsync();
      setEstadoNotificaciones(notificaciones.granted ? 'concedido' : 'denegado');
    }

    void cargarPermisos();
  }, []);

  return {
    estadoUbicacion,
    estadoNotificaciones,
  };
}
