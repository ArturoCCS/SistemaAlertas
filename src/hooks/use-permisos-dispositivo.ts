import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

type EstadoPermiso = 'pendiente' | 'concedido' | 'denegado';

export function usePermisosDispositivo() {
  const [estadoUbicacion, setEstadoUbicacion] = useState<EstadoPermiso>('pendiente');
  const [estadoNotificaciones, setEstadoNotificaciones] = useState<EstadoPermiso>('pendiente');

  useEffect(() => {
    async function cargarPermisos() {
      const ubicacion = await Location.getForegroundPermissionsAsync();
      setEstadoUbicacion(ubicacion.granted ? 'concedido' : 'denegado');

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
