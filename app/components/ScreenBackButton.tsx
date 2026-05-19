import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useAppTheme } from '../context/AppThemeContext';

type Props = {
  label: string;
  onPress: () => void;
};

export default function ScreenBackButton({ label, onPress }: Props) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          alignSelf: 'flex-start',
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 999,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.dashboardFeatureBorder,
          marginBottom: 12,
        },
        text: {
          color: colors.charcoal,
          fontWeight: '600',
          fontSize: 14,
        },
      }),
    [colors]
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}
