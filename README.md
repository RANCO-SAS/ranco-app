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

## Estructura

- `src/app/` — rutas Expo Router
- `src/features/` — módulos por dominio (auth, profile, jobs, etc.)
- `src/components/` — UI reutilizable
- `supabase/migrations/` — migraciones de base de datos
