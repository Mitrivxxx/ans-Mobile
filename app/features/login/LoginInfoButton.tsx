import React, { useCallback } from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ansColors } from '../../theme/ansTheme';
import { loginInfoButtonStyles as styles } from './LoginInfoButton.styles';

const LOGIN_INFO_MESSAGE =
  'Aby zalogować się do aplikacji mobilnej, użyj tego samego loginu i hasła, których używasz w systemie WD ANS.';

export default function LoginInfoButton() {
  const onPress = useCallback(() => {
    Alert.alert('Informacja o logowaniu', LOGIN_INFO_MESSAGE, [
      { text: 'Rozumiem', style: 'default' },
    ]);
  }, []);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel="Informacja o logowaniu"
    >
      <MaterialCommunityIcons
        name="information-outline"
        size={20}
        color={ansColors.goldDark}
      />
      <Text style={styles.label}>Jak się zalogować?</Text>
    </TouchableOpacity>
  );
}
