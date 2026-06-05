// Baner pokazujący postęp synchronizacji.
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { SyncStatus } from '../core/queryClient/syncTypes';
import { useAppTheme } from '../context/AppThemeContext';

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
  accentColor,
  onDismissUpToDate,
}: Props) {
  const { colors } = useAppTheme();
  const resolvedAccent = accentColor ?? colors.gold;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        banner: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 10,
          paddingHorizontal: 14,
          marginBottom: 12,
          borderRadius: 12,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.grayBorder,
        },
        bannerSuccess: {
          borderColor: colors.successBorder,
          backgroundColor: colors.successBg,
        },
        bannerError: {
          borderColor: colors.grayBorder,
          backgroundColor: colors.errorBg,
        },
        loadingText: {
          fontSize: 13,
          color: colors.gray,
          fontWeight: '600',
        },
        successText: {
          fontSize: 13,
          color: colors.charcoal,
          fontWeight: '700',
        },
        errorText: {
          fontSize: 13,
          color: colors.error,
          fontWeight: '600',
        },
      }),
    [colors]
  );

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
        <ActivityIndicator size="small" color={resolvedAccent} />
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
        color={colors.error}
      />
      <Text style={styles.errorText}>{errorText}</Text>
    </View>
  );
}
