import React from 'react';
import { View } from 'react-native';

import { logoHeaderForTheme } from '../../../assets/brandLogos';
import AppLogo from '../../../components/AppLogo';
import { useAppTheme } from '../../../context/AppThemeContext';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import {
  DASHBOARD_HEADER_LOGO_SIZE,
  createDashboardHeaderBackgroundStyles,
} from './DashboardHeaderBackground.styles';

export default function DashboardHeaderBackground() {
  const { isDarkMode } = useAppTheme();
  const styles = useThemedStyles(createDashboardHeaderBackgroundStyles);
  return (
    <View style={styles.root}>
      <AppLogo
        size={DASHBOARD_HEADER_LOGO_SIZE}
        source={logoHeaderForTheme(isDarkMode)}
        variant="wide"
        resizeMode="contain"
      />
    </View>
  );
}
