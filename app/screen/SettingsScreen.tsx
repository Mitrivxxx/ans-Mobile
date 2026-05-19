import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../context/AppThemeContext';

export default function SettingsScreen() {
  const { isDarkMode, colors, toggleDarkMode } = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.screenBackground }]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Ustawienia</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Preferencje aplikacji
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.textBlock}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Tryb ciemny
            </Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Zmien wyglad aplikacji na ciemny motyw.
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{
              false: colors.switchTrackOff,
              true: colors.switchTrackOn,
            }}
            thumbColor={colors.switchThumb}
            ios_backgroundColor={colors.switchTrackOff}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
