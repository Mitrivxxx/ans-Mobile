import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTheme } from '../context/AppThemeContext';
import { useAppUpdates } from '../context/AppUpdatesContext';

export default function AppUpdatesBanner() {
  const { colors } = useAppTheme();
  const { pendingReload, checking, applyPendingUpdate } = useAppUpdates();

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
          backgroundColor: colors.successBg,
          borderWidth: 1,
          borderColor: colors.grayBorder,
        },
        text: {
          flex: 1,
          fontSize: 13,
          lineHeight: 18,
          color: colors.charcoal,
          fontWeight: '600',
        },
        actions: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        button: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          backgroundColor: colors.gold,
        },
        buttonPressed: {
          opacity: 0.85,
        },
        buttonText: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.black,
        },
      }),
    [colors]
  );

  if (!pendingReload && !checking) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.banner}>
        <MaterialCommunityIcons
          name="cloud-download-outline"
          size={20}
          color={colors.charcoal}
        />
        <Text style={styles.text}>
          {checking
            ? 'Pobieranie aktualizacji aplikacji…'
            : 'Dostępna nowa wersja. Uruchom ponownie, aby zastosować zmiany.'}
        </Text>
        <View style={styles.actions}>
          {checking ? (
            <ActivityIndicator size="small" color={colors.gold} />
          ) : (
            <Pressable
              onPress={() => void applyPendingUpdate()}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Uruchom</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
