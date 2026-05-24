import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { AuthError } from '@/features/auth/utils/map-auth-error';

const OAUTH_TIMEOUT_MS = 120_000;
const ANDROID_DISMISS_GRACE_MS = 2_000;

function isOAuthCallbackUrl(url: string, redirectTo: string): boolean {
  if (url.startsWith(redirectTo)) {
    return true;
  }

  const hasAuthCallbackPath = url.includes('/auth/callback') || url.includes('/--/auth/callback');
  const hasAuthPayload =
    url.includes('code=') || url.includes('access_token=') || url.includes('error=');

  if (!hasAuthCallbackPath || !hasAuthPayload) {
    return false;
  }

  try {
    const redirectOrigin = new URL(redirectTo).origin;
    return url.startsWith(redirectOrigin);
  } catch {
    return url.includes('exp://') || url.includes('ranco://');
  }
}

async function prepareAndroidBrowser(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await WebBrowser.warmUpAsync();
  } catch {
    // warmUp is best-effort; OAuth can still proceed without it.
  }
}

function waitForAndroidDismissGracePeriod(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ANDROID_DISMISS_GRACE_MS);
  });
}

export async function openOAuthSession(authUrl: string, redirectTo: string): Promise<string> {
  await prepareAndroidBrowser();

  if (__DEV__) {
    const canOpenRedirect = await Linking.canOpenURL(redirectTo).catch(() => false);
    console.info('[oauth] canOpenURL redirectTo:', canOpenRedirect);
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanup = (subscription: { remove: () => void }) => {
      subscription.remove();
    };

    const finish = (handler: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      handler();
    };

    const subscription = Linking.addEventListener('url', (event) => {
      if (__DEV__) {
        console.info('[oauth] deep link recibido:', event.url);
      }

      if (!isOAuthCallbackUrl(event.url, redirectTo)) {
        return;
      }

      if (event.url.includes('error=')) {
        if (__DEV__) {
          console.info('[oauth] deep link con error ignorado; se usa el resultado del navegador');
        }
        return;
      }

      finish(() => {
        cleanup(subscription);
        void WebBrowser.dismissBrowser();
        resolve(event.url);
      });
    });

    const timeoutId = setTimeout(() => {
      finish(() => {
        cleanup(subscription);
        reject(
          new AuthError(
            'El inicio de sesión tardó demasiado. Cierra el navegador e inténtalo de nuevo.',
            'oauth_timeout',
          ),
        );
      });
    }, OAUTH_TIMEOUT_MS);

    void WebBrowser.openAuthSessionAsync(authUrl, redirectTo, {
      preferEphemeralSession: Platform.OS === 'ios',
    })
      .then(async (result) => {
        if (__DEV__) {
          console.info('[oauth] resultado del navegador:', result.type);
        }

        if (result.type === 'success') {
          if (!result.url || result.url.includes('error=')) {
            finish(() => {
              cleanup(subscription);
              reject(
                new AuthError(
                  'No se pudo completar el inicio de sesión. Inténtalo de nuevo.',
                  'oauth_failed',
                ),
              );
            });
            return;
          }

          finish(() => {
            cleanup(subscription);
            resolve(result.url);
          });
          return;
        }

        if (result.type === 'cancel' || result.type === 'dismiss') {
          if (Platform.OS === 'android') {
            await waitForAndroidDismissGracePeriod();

            const pendingUrl = Linking.getLinkingURL();

            if (pendingUrl && isOAuthCallbackUrl(pendingUrl, redirectTo)) {
              if (__DEV__) {
                console.info('[oauth] deep link tardío detectado:', pendingUrl);
              }

              finish(() => {
                cleanup(subscription);
                resolve(pendingUrl);
              });
              return;
            }
          }

          finish(() => {
            cleanup(subscription);
            reject(new AuthError('Inicio de sesión cancelado.', 'oauth_cancelled'));
          });
        }
      })
      .catch((error: unknown) => {
        finish(() => {
          cleanup(subscription);
          reject(error);
        });
      });
  });
}
