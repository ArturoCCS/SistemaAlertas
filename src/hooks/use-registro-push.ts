import Constants from 'expo-constants';
import type * as NotificationsType from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useSesion } from '@/src/hooks/use-sesion';
import { actualizarPushToken } from '@/src/services/notificaciones';
import { ejecutandoEnExpoGo } from '@/src/utils/entorno';

/**
 * En Expo Go (SDK 53+) el solo hecho de importar `expo-notifications` en
 * Android lanza un error: el paquete registra un listener de push token como
 * efecto secundario al cargarse. Por eso el import es dinámico y se omite
 * por completo en Expo Go (ver src/tasks/ubicacion-background-task.ts para
 * el mismo patrón con expo-task-manager).
 */
const notificacionesPromise: Promise<typeof NotificationsType> | null = ejecutandoEnExpoGo
  ? null
  : import('expo-notifications').then((Notifications) => {
      // El servidor ya filtra candidatos por celda H3 + radio de la alerta antes de
      // enviar el push (ver supabase/functions/motor-distribucion). Aquí solo se
      // decide prioridad/sonido según severidad y estado del payload.
      Notifications.setNotificationHandler({
        handleNotification: async (notificacion) => {
          const datos = notificacion.request.content.data as {
            severidad?: string;
            estado?: string;
          };
          const esCritica = datos?.severidad === 'alta' && datos?.estado === 'verificada';

          return {
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: esCritica || datos?.estado !== 'no_confirmada',
            shouldSetBadge: false,
            priority: esCritica
              ? Notifications.AndroidNotificationPriority.MAX
              : Notifications.AndroidNotificationPriority.DEFAULT,
          };
        },
      });

      return Notifications;
    });

export function useRegistroPush() {
  const { usuario } = useSesion();

  useEffect(() => {
    if (!usuario || !notificacionesPromise) {
      if (usuario && ejecutandoEnExpoGo) {
        console.warn(
          'Notificaciones push no disponibles en Expo Go: usa un development build para probarlas.',
        );
      }
      return;
    }

    let cancelado = false;

    async function registrar() {
      const Notifications = await notificacionesPromise!;

      const permisoActual = await Notifications.getPermissionsAsync();
      let estado = permisoActual.status;

      if (estado !== 'granted') {
        const solicitado = await Notifications.requestPermissionsAsync();
        estado = solicitado.status;
      }

      if (estado !== 'granted' || cancelado) {
        return;
      }

      if (Platform.OS === 'android') {
        // Sin `sound`: usa el sonido del sistema. Pasar 'default' exige
        // empaquetar un archivo de sonido llamado así en el plugin de
        // expo-notifications, que este prototipo no incluye.
        await Notifications.setNotificationChannelAsync('alertas-criticas', {
          name: 'Alertas críticas',
          importance: Notifications.AndroidImportance.MAX,
          bypassDnd: true,
        });
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;

      try {
        const token = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        );

        if (!cancelado) {
          await actualizarPushToken(token.data);
        }
      } catch (error) {
        console.error('No fue posible registrar el token de notificaciones push', error);
      }
    }

    void registrar();

    return () => {
      cancelado = true;
    };
  }, [usuario]);
}
