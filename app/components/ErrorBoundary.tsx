import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAppTheme } from '../context/AppThemeContext';

type Variant = 'app' | 'screen';

type Props = {
  children: ReactNode;
  variant?: Variant;
  onRetry?: () => void;
};

type State = {
  hasError: boolean;
  message: string;
};

function ErrorFallback({
  message,
  onRetry,
  variant,
}: {
  message: string;
  onRetry: () => void;
  variant: Variant;
}) {
  const { colors } = useAppTheme();
  const isScreen = variant === 'screen';
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: isScreen ? 20 : 24,
      backgroundColor: isScreen ? colors.background : colors.surface,
    },
    title: {
      fontSize: isScreen ? 18 : 20,
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
        {isScreen
          ? 'Ten ekran napotkał nieoczekiwany błąd. Możesz spróbować ponownie lub wrócić do menu.'
          : 'Aplikacja napotkała nieoczekiwany błąd. Możesz spróbować ponownie.'}
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

export default class ErrorBoundary extends Component<Props, State> {
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
    const label =
      this.props.variant === 'screen' ? 'SCREEN ERROR BOUNDARY' : 'APP ERROR BOUNDARY';
    console.error(`[${label}]`, error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.props.onRetry?.();
    this.setState({ hasError: false, message: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          message={this.state.message}
          onRetry={this.handleRetry}
          variant={this.props.variant ?? 'app'}
        />
      );
    }

    return this.props.children;
  }
}
