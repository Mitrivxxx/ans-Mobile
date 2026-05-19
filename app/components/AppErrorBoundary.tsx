import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ansColors } from '../theme/ansTheme';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Nieznany błąd',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[APP ERROR BOUNDARY]', error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, message: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Coś poszło nie tak</Text>
          <Text style={styles.message}>
            Aplikacja napotkała nieoczekiwany błąd. Możesz spróbować ponownie.
          </Text>
          {__DEV__ && this.state.message ? (
            <Text style={styles.devMessage}>{this.state.message}</Text>
          ) : null}
          <Pressable
            onPress={this.handleRetry}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Spróbuj ponownie</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: ansColors.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: ansColors.black,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: ansColors.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  devMessage: {
    fontSize: 12,
    color: ansColors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: ansColors.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: ansColors.black,
  },
});
