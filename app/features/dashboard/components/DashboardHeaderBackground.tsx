import React from 'react';
import { Image, View } from 'react-native';

import { dashboardHeaderBackgroundStyles as styles } from './DashboardHeaderBackground.styles';

const ansLogo = require('../../../../assets/icons/anslogo.png');

export default function DashboardHeaderBackground() {
  return (
    <View style={styles.root}>
      <Image
        source={ansLogo}
        style={styles.logo}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        accessibilityLabel="Logo Akademii Nauk Stosowanych w Nowym Sączu"
      />
    </View>
  );
}
