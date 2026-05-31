import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { devLog } from '../config/devLog';
import { useAppTheme } from '../context/AppThemeContext';
import {
  ensureScraperInfraReady,
  isScraperInfraReady,
} from '../core/scraper/auth/bootstrapSession';
import { startupMark, startupMeasure } from '../core/startup/startupMetrics';

type Props = {
  children: React.ReactNode;
};

export default function AppInitGate({ children }: Props) {
  const { colors } = useAppTheme();
  const [ready, setReady] = useState(isScraperInfraReady);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    startupMark('app-init-start');

    try {
      await ensureScraperInfraReady();
      startupMark('app-init-ready');
      startupMeasure('AppInitGate -> ready', 'app-init-start', 'app-init-ready');
      devLog('Init', 'app init gate ready');
      setReady(true);
    } catch (err: unknown) {
      console.error('[APP] Init error:', err);
      setReady(false);
      setError(
        err instanceof Error
          ? err.message
          : 'Nie udało się zainicjować połączenia z WD.'
      );
    }
  }, []);

  useEffect(() => {
    if (ready) {
      return;
    }
    void bootstrap();
  }, [bootstrap, ready]);

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

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
