import Constants from 'expo-constants';

type Env = {
  apiUrl: string;
  wsUrl: string;
};

type AppExtra = {
  apiUrl?: string;
  wsUrl?: string;
};

const extra = Constants.expoConfig?.extra as AppExtra | undefined;

export const env: Env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? extra?.apiUrl ?? 'http://localhost:8080',
  wsUrl: process.env.EXPO_PUBLIC_WS_URL ?? extra?.wsUrl ?? 'ws://localhost:8080',
};

export function isApiConfigured(): boolean {
  return Boolean(env.apiUrl && env.wsUrl);
}
