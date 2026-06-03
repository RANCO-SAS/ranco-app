import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type RootErrorBoundaryProps = {
  children: ReactNode;
};

type RootErrorBoundaryState = {
  hasError: boolean;
};

export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RootErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[RootErrorBoundary]', error.message, info.componentStack);

    if (!__DEV__) {
      Alert.alert(
        'Error en la aplicación',
        'Ocurrió un problema inesperado. Cierra y vuelve a abrir la app.',
      );
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <AppText align="center" variant="title">
          Algo salió mal
        </AppText>
        <AppText align="center" color="textSecondary" variant="body">
          La aplicación encontró un error. Puedes intentar recuperar la pantalla o reiniciar la
          app.
        </AppText>
        <Button label="Reintentar" onPress={this.handleRetry} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.lg,
  },
});
