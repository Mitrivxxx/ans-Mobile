// Łapie i pokazuje błędy interfejsu.
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAppTheme } from '../context/AppThemeContext';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

function AppErrorFallback({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const { colors } = useAppTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colors.surface,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.charcoal,
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.gray,
      textAlign: 'center',
      marginBottom: 16,
    },
    devMessage: {
      fontSize: 12,
      color: colors.error,
      textAlign: 'center',
      marginBottom: 16,
    },
    button: {
      backgroundColor: colors.gold,
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
      color: colors.black,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coś poszło nie tak</Text>
      <Text style={styles.message}>
        Aplikacja napotkała nieoczekiwany błąd. Możesz spróbować ponownie.
      </Text>
      {__DEV__ && message ? (
        <Text style={styles.devMessage}>{message}</Text>
      ) : null}
      <Pressable
        onPress={onRetry}
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
        <AppErrorFallback
          message={this.state.message}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
