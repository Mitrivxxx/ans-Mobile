import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuthSession } from '../context/AuthSessionContext';
import { ansColors } from '../theme/ansTheme';

export default function AuthSyncBanner() {
  const {
    sessionDegraded,
    sessionDegradedMessage,
    retrySessionRestore,
    signOut,
  } = useAuthSession();

  if (!sessionDegraded) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.banner}>
        <MaterialCommunityIcons
          name="cloud-off-outline"
          size={20}
          color={ansColors.error}
        />
        <Text style={styles.errorText}>
          {sessionDegradedMessage ||
            'Sesja WD wygasła. Wyświetlane są zapisane dane — mogą być nieaktualne.'}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => void retrySessionRestore()}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionPrimary}>Spróbuj ponownie</Text>
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

const styles = StyleSheet.create({
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
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#F5C6C6',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: ansColors.error,
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
    color: ansColors.gold,
  },
  actionSecondary: {
    fontSize: 13,
    fontWeight: '600',
    color: ansColors.gray,
  },
});
