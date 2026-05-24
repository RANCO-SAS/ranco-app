import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_REF = 'ivobohmthkqcxpbndxpk';
const MANAGEMENT_API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

const REDIRECT_URLS = ['ranco://auth/callback', 'ranco://**', 'exp://**'];

function loadEnvFile(filePath) {
  const env = {};

  try {
    const content = readFileSync(filePath, 'utf8');

    for (const line of content.split('\n')) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      env[key] = value;
    }
  } catch {
    return env;
  }

  return env;
}

function parseAllowList(value) {
  if (!value) {
    return [];
  }

  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function mergeAllowList(currentValue, requiredUrls) {
  const merged = new Set([...parseAllowList(currentValue), ...requiredUrls]);
  return Array.from(merged).join(',');
}

async function main() {
  const envPath = resolve(process.cwd(), '.env');
  const env = {
    ...loadEnvFile(envPath),
    ...process.env,
  };

  const accessToken = env.SUPABASE_ACCESS_TOKEN;
  const clientId =
    env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID ??
    '822497506750-u61j4i87mf714hvnd0udstma01tsbqmo.apps.googleusercontent.com';
  const clientSecret = env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET;

  if (!accessToken) {
    console.error(
      'Falta SUPABASE_ACCESS_TOKEN en .env.\n' +
        'Genera uno en https://supabase.com/dashboard/account/tokens y vuelve a ejecutar:\n' +
        'node scripts/configure-google-oauth.mjs',
    );
    process.exit(1);
  }

  if (!clientSecret) {
    console.error(
      'Falta SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET en .env.\n' +
        'Agrega el client secret de Google Cloud y vuelve a ejecutar el script.',
    );
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const currentResponse = await fetch(MANAGEMENT_API_URL, { headers });

  if (!currentResponse.ok) {
    const errorBody = await currentResponse.text();
    console.error(`No se pudo leer la config de auth (${currentResponse.status}): ${errorBody}`);
    process.exit(1);
  }

  const currentConfig = await currentResponse.json();
  const uriAllowList = mergeAllowList(currentConfig.uri_allow_list, REDIRECT_URLS);

  const patchResponse = await fetch(MANAGEMENT_API_URL, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      site_url: 'ranco://auth/callback',
      uri_allow_list: uriAllowList,
      external_google_enabled: true,
      external_google_client_id: clientId,
      external_google_secret: clientSecret,
    }),
  });

  if (!patchResponse.ok) {
    const errorBody = await patchResponse.text();
    console.error(`No se pudo actualizar Google OAuth (${patchResponse.status}): ${errorBody}`);
    process.exit(1);
  }

  const updatedConfig = await patchResponse.json();

  console.log('Google OAuth configurado en Supabase.');
  console.log(`- Google habilitado: ${updatedConfig.external_google_enabled ? 'sí' : 'no'}`);
  console.log(`- Client ID: ${updatedConfig.external_google_client_id ?? clientId}`);
  console.log(`- Redirect URLs: ${updatedConfig.uri_allow_list ?? uriAllowList}`);
  console.log('');
  console.log(
    'Verifica en Google Cloud que este redirect URI esté autorizado:\n' +
      'https://ivobohmthkqcxpbndxpk.supabase.co/auth/v1/callback',
  );
}

void main();
