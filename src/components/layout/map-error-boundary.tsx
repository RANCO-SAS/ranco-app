import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type MapErrorBoundaryProps = {
  children: ReactNode;
  onClose?: () => void;
};

type MapErrorBoundaryState = {
  hasError: boolean;
};

export class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      console.error('[MapErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <AppText align="center" variant="subtitle">
          No se pudo cargar el mapa
        </AppText>
        <AppText align="center" color="textSecondary" variant="body">
          Ocurrió un error al abrir el mapa. Cierra e inténtalo de nuevo. Si el problema
          continúa, verifica la configuración de Google Maps en el build.
        </AppText>
        {this.props.onClose ? (
          <Button label="Cerrar" onPress={this.props.onClose} variant="secondary" />
        ) : null}
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
