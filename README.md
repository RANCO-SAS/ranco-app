# Ranco

Marketplace móvil que conecta clientes con profesionales de servicios cercanos.

## Documentación del prototipo

Guía completa para entender, presentar y explicar el proyecto: nombre, descripción, funcionalidades, flujos, modelo de negocio, stack, estado del MVP y guion de demo.

→ **[docs/prototipo.md](docs/prototipo.md)**

## Requisitos

- Node.js 20+
- npm
- Expo Go o un development build

## Configuración

1. Copia las variables de entorno:

   ```bash
   cp .env.example .env
   ```

2. Completa `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` con los valores de tu proyecto Supabase.

3. Instala dependencias:

   ```bash
   npm install
   ```

## Desarrollo

```bash
npm start
```

Opciones adicionales:

```bash
npm run android
npm run ios
npm run web
```

## Splash (Lottie)

El arranque usa un splash nativo de **solo color** (tema claro/oscuro) y un overlay Lottie (`assets/lotties/welcome.json`). La fuente de verdad del plugin es [`app.config.js`](app.config.js) (colores alineados con `src/constants/splash.ts`).

`expo.icon` y `adaptiveIcon` en `app.json` son del **launcher**, no del splash. Si ves icono en el splash, el proyecto nativo está desactualizado.

Tras cambiar splash o plugins, **rebuild nativo obligatorio** (Expo Go no refleja el splash real):

```bash
npx expo prebuild --clean --platform android
npm run android
```

O un build nuevo en EAS (`npm run eas:build:preview`).

Checklist manual:

- Modo claro: fondo `#F1F5F9` sin icono entre nativo y Lottie
- Modo oscuro: fondo `#000000`
- Lottie arranca desde frame 0 tras ocultar el splash nativo
- Cold start: animación completa y fade ~200ms antes del contenido

## Mapas (Google Maps)

En Android el mapa requiere `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID` en `.env` (local) o en EAS (`preview` / `production`). Sin key, la app muestra un mensaje en lugar de cerrarse.

```bash
# EAS (ejemplo)
eas env:create --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID --value "TU_KEY" --environment preview --environment production
```

Tras añadir o cambiar la key, genera un **nuevo build** (`prebuild` + APK o EAS).

## Diagnóstico de crashes (APK / release)

Errores JavaScript: `RootErrorBoundary` y logs en consola. Crashes nativos (p. ej. mapas): revisar logcat con el dispositivo conectado:

```bash
adb logcat | grep -E "AndroidRuntime|ReactNative|Google|Maps|FATAL"
```

Filtra por el momento en que reproduces el fallo (abrir mapa en crear solicitud).

## Estructura

- `src/app/` — rutas Expo Router
- `src/features/` — módulos por dominio (auth, profile, jobs, etc.)
- `src/components/` — UI reutilizable
- `supabase/migrations/` — migraciones de base de datos
