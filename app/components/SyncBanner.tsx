import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { SyncStatus } from '../core/queryClient/syncTypes';
import { ansColors } from '../theme/ansTheme';

type Props = {
  status: SyncStatus;
  loadingText: string;
  errorText: string;
  accentColor?: string;
  onDismissUpToDate: () => void;
};

const UP_TO_DATE_VISIBLE_MS = 4000;

export default function SyncBanner({
  status,
  loadingText,
  errorText,
  accentColor = ansColors.gold,
  onDismissUpToDate,
}: Props) {
  useEffect(() => {
    if (status !== 'upToDate') {
      return;
    }

    const timer = setTimeout(onDismissUpToDate, UP_TO_DATE_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [status, onDismissUpToDate]);

  if (status === 'idle') {
    return null;
  }

  if (status === 'loading') {
    return (
      <View style={styles.banner}>
        <ActivityIndicator size="small" color={accentColor} />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    );
  }

  if (status === 'upToDate') {
    return (
      <View style={[styles.banner, styles.bannerSuccess]}>
        <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" />
        <Text style={styles.successText}>Jesteś na bieżąco</Text>
      </View>
    );
  }

  return (
    <View style={[styles.banner, styles.bannerError]}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={18}
        color={ansColors.error}
      />
      <Text style={styles.errorText}>{errorText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: ansColors.surface,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
  },
  bannerSuccess: {
    borderColor: '#B8E6C1',
    backgroundColor: '#F3FBF5',
  },
  bannerError: {
    borderColor: '#F5C6C6',
    backgroundColor: '#FFF5F5',
  },
  loadingText: {
    fontSize: 13,
    color: ansColors.gray,
    fontWeight: '600',
  },
  successText: {
    fontSize: 13,
    color: ansColors.charcoal,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 13,
    color: ansColors.error,
    fontWeight: '600',
  },
});
