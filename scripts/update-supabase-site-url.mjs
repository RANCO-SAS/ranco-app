import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_REF = 'ivobohmthkqcxpbndxpk';
const MANAGEMENT_API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

const EXPO_GO_SITE_URL = 'exp://192.168.1.7:8081/--/auth/callback';

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

      env[trimmed.slice(0, separatorIndex).trim()] = trimmed.slice(separatorIndex + 1).trim();
    }
  } catch {
    return env;
  }

  return env;
}

async function main() {
  const env = {
    ...loadEnvFile(resolve(process.cwd(), '.env')),
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

  const patchResponse = await fetch(MANAGEMENT_API_URL, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      site_url: EXPO_GO_SITE_URL,
    }),
  });

  if (!patchResponse.ok) {
    const errorBody = await patchResponse.text();
    console.error(`No se pudo actualizar site_url (${patchResponse.status}): ${errorBody}`);
    process.exit(1);
  }

  const updatedConfig = await patchResponse.json();
  console.log('site_url actualizado:', updatedConfig.site_url ?? EXPO_GO_SITE_URL);
}

void main();
