import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { ansColors } from '../theme/ansTheme';

type Props = {
  label: string;
  onPress: () => void;
};

export default function ScreenBackButton({ label, onPress }: Props) {
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

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: ansColors.surface,
    borderWidth: 1,
    borderColor: ansColors.dashboardFeatureBorder,
    marginBottom: 12,
  },
  text: {
    color: ansColors.charcoal,
    fontWeight: '600',
    fontSize: 14,
  },
});
