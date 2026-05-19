import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAppTheme } from '../context/AppThemeContext';
import { setupScraperAuthGuard } from '../core/scraper/auth/ensureAuthenticated';
import { initClient } from '../core/scraper/client/client';

type Props = {
  children: React.ReactNode;
};

export default function AppInitGate({ children }: Props) {
  const { colors } = useAppTheme();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: colors.surface,
        },
        hint: {
          marginTop: 12,
          fontSize: 14,
          color: colors.gray,
        },
        title: {
          fontSize: 18,
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
      }),
    [colors]
  );

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setupScraperAuthGuard();
      await initClient();
      setReady(true);
    } catch (err: unknown) {
      console.error('[APP] Init error:', err);
      setReady(false);
      setError(
        err instanceof Error
          ? err.message
          : 'Nie udało się zainicjować połączenia z WD.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.hint}>Ładowanie aplikacji…</Text>
      </View>
    );
  }

  if (!ready && error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Błąd inicjalizacji</Text>
        <Text style={styles.message}>{error}</Text>
        <Pressable
          onPress={() => void bootstrap()}
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

  return <>{children}</>;
}
