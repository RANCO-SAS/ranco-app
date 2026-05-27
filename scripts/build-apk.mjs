import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

function loadEnvFile(filePath) {
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

    if (key) {
      process.env[key] = value;
    }
  }
}

function resolveAndroidSdkPath() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    process.platform === 'win32'
      ? join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk')
      : join(homedir(), 'Library', 'Android', 'sdk'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function ensureLocalProperties(androidDir) {
  const localPropertiesPath = join(androidDir, 'local.properties');

  if (existsSync(localPropertiesPath)) {
    return;
  }

  const sdkPath = resolveAndroidSdkPath();

  if (!sdkPath) {
    throw new Error(
      'No se encontró el Android SDK. Define ANDROID_HOME o crea android/local.properties.',
    );
  }

  const escapedSdkPath = sdkPath.replace(/\\/g, '\\\\');
  writeFileSync(localPropertiesPath, `sdk.dir=${escapedSdkPath}\n`, 'utf8');
}

const isDebugBuild = process.argv.includes('--debug');
const projectRoot = process.cwd();
const envPath = join(projectRoot, '.env');

loadEnvFile(envPath);
process.env.NODE_ENV = isDebugBuild ? 'development' : 'production';

const androidDir = join(projectRoot, 'android');
const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const assembleTask = isDebugBuild ? 'assembleDebug' : 'assembleRelease';

ensureLocalProperties(androidDir);

const cleanResult = spawnSync(gradleCommand, ['clean'], {
  cwd: androidDir,
  env: process.env,
  stdio: 'inherit',
  shell: true,
});

if (cleanResult.status !== 0) {
  process.exit(cleanResult.status ?? 1);
}

const result = spawnSync(gradleCommand, [assembleTask], {
  cwd: androidDir,
  env: process.env,
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 1);
