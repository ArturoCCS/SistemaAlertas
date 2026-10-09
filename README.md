# ALERTA CERCA

Sistema de alertas comunitarias por proximidad sobre Expo/React Native + Supabase. Implementa
el ciclo completo descrito en `ALERTA CERCA — Especificación para adaptar la app.md`: reportar,
verificar/corroborar, distribuir por cercanía (radios escalonados + celdas H3) y recibir según
preferencias del usuario.

## Stack

- Expo + React Native + TypeScript estricto, Expo Router (`app/`)
- TanStack Query + Zustand (sesión)
- Supabase: Postgres/PostGIS, Auth, Storage, Edge Functions (Deno), `pg_cron` + `pg_net`
- `h3-js` (celdas H3 en cliente y en la Edge Function del motor de distribución)
- `expo-location` (foreground + background), `expo-notifications` (push), `expo-image-picker` /
  `expo-image-manipulator` / `react-native-view-shot` (foto con redacción manual), `react-native-maps`

## Módulos (ver el documento de especificación)

| Módulo | Dónde vive |
| --- | --- |
| Ubicación | `src/hooks/use-ubicacion.ts`, `src/tasks/ubicacion-background-task.ts` |
| Reportar | `app/(tabs)/crear-reporte.tsx`, `src/components/redactor-foto.tsx` |
| Preferencias | `app/(onboarding)/preferencias-iniciales.tsx`, `app/(tabs)/ajustes.tsx` |
| Motor de distribución | `supabase/functions/motor-distribucion/`, funciones SQL en la migración fase 2 |
| Notificaciones | `src/hooks/use-registro-push.ts`, Expo Push API desde la Edge Function |
| Moderación | `app/(admin)/` |

## Requisitos

- Node.js 20+
- npm 10+
- Expo CLI (vía `npx expo`)
- Cuenta de Supabase con el proyecto ya vinculado en `.env`
- Supabase CLI (`npx supabase`) para aplicar migraciones y desplegar Edge Functions
- (Opcional) EAS CLI: `npm i -g eas-cli` — necesario para builds con ubicación en segundo plano

## Variables de entorno

```bash
cp .env.example .env
```

- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (opcional, mapa nativo con Google Maps)
- `EXPO_PUBLIC_EAS_PROJECT_ID` (necesario para el token de push de Expo)

Si Supabase no está configurado, la app no se rompe: muestra mensajes en español con
instrucciones (`src/components/mensaje-configuracion.tsx`).

## Instalación y ejecución local

```bash
npm install
npm run start   # o: npm run android / npm run ios / npm run web
```

> La ubicación en segundo plano y las notificaciones push **no funcionan en Expo Go**: usa un
> development build (`eas build --profile development`).

## Base de datos: aplicar la migración

```bash
npx supabase link --project-ref <tu-project-ref>
npx supabase db push
```

La migración `supabase/migrations/20261008120000_alerta_cerca_fase2.sql` agrega sobre la base
inicial:

- Estados de alerta del documento: `no_confirmada`, `corroborada`, `verificada`, `descartada`, `cerrada`.
- Categorías con severidad/radio inicial/radio máximo/vigencia (seed de las 7 del documento) y
  anillos escalonados (`categoria_radios`).
- Perfiles con celda H3 (no coordenada exacta), rol, anti-abuso y reputación.
- `usuario_preferencias`, `usuario_categoria_preferencias`, `zonas_guardadas`, `notificaciones_enviadas`.
- Funciones de negocio: `crear_reporte`, `evaluar_corroboracion_automatica`, `reaccionar_reporte`,
  `moderar_verificar_reporte` / `moderar_descartar_reporte` / `moderar_cerrar_reporte`,
  `actualizar_celda_perfil`, `actualizar_push_token`, `eliminar_cuenta_propia`, `radio_actual_reporte`.
- Bucket privado de Storage `fotos-reportes`.
- RLS en todas las tablas nuevas; `reportes` ahora también es legible por moderadores/autoridad.

### Dar de alta a un moderador

No hay flujo in-app para esto (evita que un usuario se autoasigne el rol). Desde el SQL editor
de Supabase, con la cuenta ya registrada:

```sql
update public.perfiles set rol = 'moderador' where id = '<uuid-del-usuario>';
```

### Conectar el motor de distribución (Edge Functions)

```bash
npx supabase functions deploy motor-distribucion
npx supabase functions deploy eliminar-cuenta
```

Las funciones usan los secretos automáticos `SUPABASE_URL`, `SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY` que Supabase inyecta en todo proyecto; no hace falta configurarlos
a mano.

Después, dile a Postgres dónde está `motor-distribucion` para que `crear_reporte` y
`moderar_verificar_reporte` puedan avisarle (y para que el barrido de `pg_cron` funcione):

```sql
insert into private.configuracion (clave, valor) values
  ('motor_distribucion_url', 'https://<tu-project-ref>.supabase.co/functions/v1/motor-distribucion'),
  ('service_role_key', '<tu-service-role-key>')
on conflict (clave) do update set valor = excluded.valor;
```

Si `pg_cron` o `pg_net` no se habilitan solos al correr la migración (algunos planes requieren
activarlos manualmente), hazlo desde **Dashboard → Database → Extensions** y vuelve a correr el
bloque final de la migración.

## Privacidad (resumen; detalle en el documento de especificación)

- El teléfono nunca envía su coordenada exacta de ubicación propia: solo su celda H3
  (resolución 8, ~0.7 km²), y el servidor solo guarda la última celda, sin historial.
- El motor de distribución calcula celdas candidatas con `h3-js` y nunca expone coordenadas
  exactas a `anon`/`authenticated` (funciones restringidas a `service_role`).
- La ubicación pública de un reporte se difumina ~100 m hasta verificarse; la ubicación exacta y
  la identidad del autor solo las ve un moderador/autoridad.
- Fotos: se recomprimen (elimina EXIF) y el usuario puede tapar manualmente zonas sensibles con
  cajas negras antes de enviar.
- "Borrar mi cuenta y datos" (`app/(tabs)/ajustes.tsx`) limpia las tablas propias y borra la
  cuenta de `auth.users` vía la Edge Function `eliminar-cuenta` (requiere Admin API/service role).

## Scripts de calidad

```bash
npm run typecheck
npm run lint
npm run test
```

## Limitaciones conocidas de este prototipo

- El crecimiento de anillos corre en un barrido de `pg_cron` cada minuto (no cumple el <10s del
  documento salvo para el primer anillo, que se dispara al crear/verificar el reporte).
- No hay detección automática por ML de rostros/placas: solo redacción manual (cajas negras) +
  limpieza de EXIF.
- No hay verificación OTP de teléfono ni difusión por SMS/Cell Broadcast.
- No hay exportación/import CAP, webhooks salientes ni API pública de autoridades (siguiente
  iteración; el modelo de datos ya es compatible con agregarlo).
- Las alertas críticas usan la prioridad/sonido máximo del sistema operativo; no se solicita el
  entitlement de *critical alerts* de Apple.
- Ubicación en segundo plano y push requieren un development build (EAS/Dev Client); no
  funcionan en Expo Go.
- El horario de silencio se compara en hora del servidor (UTC), no en la zona horaria del
  dispositivo.
