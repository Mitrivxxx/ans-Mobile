// Badge pokazujący aktywne środowisko.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getAppEnvLabel, shouldShowEnvBadge } from '../config/env';
import { useAppTheme } from '../context/AppThemeContext';
import type { AnsColors } from '../theme/ansTheme';
import { useThemedStyles } from '../theme/useThemedStyles';

function createAppEnvBadgeStyles(c: AnsColors) {
  return StyleSheet.create({
    pill: {
      position: 'absolute',
      top: 4,
      alignSelf: 'center',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: c.gold,
    },
    text: {
      fontSize: 10,
      fontWeight: '800',
      color: c.black,
      letterSpacing: 0.5,
    },
  });
}

export default function AppEnvBadge() {
  const styles = useThemedStyles(createAppEnvBadgeStyles);
  const label = getAppEnvLabel();

  if (!shouldShowEnvBadge() || !label) {
    return null;
  }

  return (
    <View style={styles.pill} pointerEvents="none">
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
