import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_REF = 'ivobohmthkqcxpbndxpk';
const MANAGEMENT_API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

const REDIRECT_URLS = [
  'ranco://auth/callback',
  'ranco://**',
  'exp://**',
  'exp://192.168.1.7:8081/--/auth/callback',
  'exp://192.168.1.7:8081/**',
];

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

  if (!accessToken) {
    console.error('Falta SUPABASE_ACCESS_TOKEN en .env.');
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
      uri_allow_list: uriAllowList,
    }),
  });

  if (!patchResponse.ok) {
    const errorBody = await patchResponse.text();
    console.error(`No se pudo actualizar redirect URLs (${patchResponse.status}): ${errorBody}`);
    process.exit(1);
  }

  const updatedConfig = await patchResponse.json();
  console.log('Redirect URLs actualizadas en Supabase:');
  console.log(updatedConfig.uri_allow_list ?? uriAllowList);
}

void main();
