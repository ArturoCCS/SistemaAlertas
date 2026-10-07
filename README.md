# ALERTA CERCA

Primera versión funcional de **ALERTA CERCA** sobre Expo/React Native con TypeScript estricto, Expo Router y base para development builds con EAS.

## Stack

- Expo + React Native + TypeScript estricto
- Expo Router (estructura `app/`)
- TanStack Query + Zustand
- Supabase (`@supabase/supabase-js`) con funciones SQL críticas
- `expo-location`, `expo-notifications`, `react-native-maps`

## Requisitos

- Node.js 20+
- npm 10+
- Expo CLI (vía `npx expo`)
- Cuenta de Supabase
- (Opcional) EAS CLI: `npm i -g eas-cli`

## Variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Variables mínimas:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (si usarás provider Google en móvil nativo)
- `EXPO_PUBLIC_EAS_PROJECT_ID` (cuando vincules con EAS)

> Si Supabase no está configurado, la app no se rompe: muestra mensajes en español con instrucciones.

## Instalación y ejecución local

```bash
npm install
npm run start
```

Atajos:

- `npm run android`
- `npm run ios`
- `npm run web`

## Development build con EAS

Archivo incluido: `eas.json` con perfiles `development`, `preview` y `production`.

Flujo recomendado:

```bash
eas login
eas build --profile development --platform android
```

(ajusta plataforma según necesidad)

## Google Maps

La configuración base usa `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` en `app.config.ts` para iOS/Android.
No se incluye ninguna clave real en el repositorio.

## Supabase y migraciones

Migración inicial:

- `supabase/migrations/20261007211000_alerta_cerca_inicial.sql`

Incluye:

- Extensiones PostGIS y `pgcrypto`
- Tablas: categorías, reglas por categoría, radios escalonados, perfiles (última ubicación), reportes, confirmaciones, auditoría administrativa
- RLS activado en todas las tablas nuevas
- Vista pública `reportes_publicos` para no exponer ubicación exacta
- Funciones SQL críticas:
  - `crear_reporte(...)`
  - `confirmar_reporte(...)`
  - `evaluar_proximidad_para_verificacion(...)` (base inicial marcada para evolución)

Aplicar migraciones (ejemplo con Supabase CLI):

```bash
supabase db push
```

## Seguridad y privacidad

- Secretos solo por variables de entorno (`.env` no versionado).
- No se guarda historial de ubicaciones: solo última ubicación del perfil.
- La ubicación exacta de reportes queda protegida en tabla privada (`reportes`), y para clientes normales se usa `reportes_publicos` con coordenadas aproximadas.
- Reglas críticas de confirmación en servidor: no auto-confirmación y no doble confirmación.

## Scripts de calidad

```bash
npm run typecheck
npm run lint
npm run test
```

## Limitaciones conocidas de esta primera versión

- La verificación por proximidad y usuarios distintos está implementada como base en servidor y marcada para evolución incremental en función SQL, evitando duplicar lógica crítica en cliente.
- La pantalla de crear reporte usa un formulario inicial simplificado y puede operar con estados vacíos cuando la base aún no está configurada.
