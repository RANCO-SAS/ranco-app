# Ranco

Marketplace móvil que conecta clientes con profesionales de servicios cercanos.

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

El arranque usa un splash nativo de color sólido (tema claro/oscuro) y un overlay con `assets/lotties/welcome.json`. Los colores están en `src/constants/splash.ts` y deben coincidir con `app.json`.

Tras cambiar el plugin `expo-splash-screen` en `app.json`, hace falta un **rebuild nativo** (Expo Go no refleja el splash configurado):

```bash
npm run android
# o
npm run ios
```

Checklist manual:

- Modo claro: fondo `#F1F5F9` sin flash azul ni icono entre nativo y Lottie
- Modo oscuro: fondo `#000000`
- La animación termina y el contenido aparece con fade ~200ms
- Cold start con sesión activa: sin parpadeo al quitar el overlay

## Estructura

- `src/app/` — rutas Expo Router
- `src/features/` — módulos por dominio (auth, profile, jobs, etc.)
- `src/components/` — UI reutilizable
- `supabase/migrations/` — migraciones de base de datos
