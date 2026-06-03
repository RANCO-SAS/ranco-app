import { Alert } from 'react-native';

type GlobalHandler = (error: unknown, isFatal?: boolean) => void;

export function registerGlobalErrorHandler(): void {
  const errorUtils = (
    globalThis as {
      ErrorUtils?: {
        getGlobalHandler: () => GlobalHandler;
        setGlobalHandler: (handler: GlobalHandler) => void;
      };
    }
  ).ErrorUtils;

  if (!errorUtils) {
    return;
  }

  const defaultHandler = errorUtils.getGlobalHandler();

  errorUtils.setGlobalHandler((error, isFatal) => {
    if (__DEV__) {
      console.error('[GlobalErrorHandler]', error, { isFatal });
    } else if (isFatal) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[GlobalErrorHandler]', message, { isFatal });
      Alert.alert(
        'Error en la aplicación',
        'Ocurrió un problema inesperado. Cierra y vuelve a abrir la app.',
      );
    }

    defaultHandler(error, isFatal);
  });
}
