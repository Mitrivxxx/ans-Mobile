import React, { useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuthSession } from '../context/AuthSessionContext';
import { useAppTheme } from '../context/AppThemeContext';

export default function AuthSyncBanner() {
  const { colors } = useAppTheme();
  const {
    sessionDegraded,
    sessionDegradedMessage,
    retrySessionRestore,
    signOut,
  } = useAuthSession();
  const [restoring, setRestoring] = useState(false);

  const handleRetry = async () => {
    if (restoring) {
      return;
    }
    setRestoring(true);
    try {
      await retrySessionRestore();
    } finally {
      setRestoring(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          paddingHorizontal: 14,
          paddingTop: 8,
          paddingBottom: 4,
        },
        banner: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 8,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: colors.errorBg,
          borderWidth: 1,
          borderColor: colors.grayBorder,
        },
        errorText: {
          flex: 1,
          fontSize: 13,
          lineHeight: 18,
          color: colors.error,
          fontWeight: '600',
        },
        actions: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 12,
          marginTop: 6,
        },
        actionButton: {
          paddingVertical: 4,
          paddingHorizontal: 2,
        },
        pressed: {
          opacity: 0.7,
        },
        actionPrimary: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.gold,
        },
        actionSecondary: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.gray,
        },
      }),
    [colors]
  );

  if (!sessionDegraded) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.banner}>
        <MaterialCommunityIcons
          name="cloud-off-outline"
          size={20}
          color={colors.error}
        />
        <Text style={styles.errorText}>
          {sessionDegradedMessage ||
            'Sesja WD wygasła. Wyświetlane są zapisane dane — mogą być nieaktualne.'}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => void handleRetry()}
          disabled={restoring}
          accessibilityRole="button"
          accessibilityState={{ disabled: restoring, busy: restoring }}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && !restoring && styles.pressed,
          ]}
        >
          {restoring ? (
            <ActivityIndicator size="small" color={colors.gold} />
          ) : (
            <Text style={styles.actionPrimary}>Spróbuj ponownie</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => void signOut()}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionSecondary}>Wyloguj</Text>
        </Pressable>
      </View>
    </View>
  );
}
